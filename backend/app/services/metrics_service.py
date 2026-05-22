"""
DefenseOS - System Metrics Service
Collects CPU, memory, disk, network and process data via psutil.
Runs as a background task on a configurable interval.
"""
import asyncio
import json
import time
from datetime import datetime, timezone
from typing import Optional

import psutil

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.metrics import (
    DiskInfo,
    NetworkConnectionInfo,
    NetworkInterfaceInfo,
    OpenPortInfo,
    ProcessInfo,
    SystemMetrics,
)

logger = get_logger(__name__)
settings = get_settings()

# Processes whose names are commonly associated with suspicious activity
# (academic reference list — NOT an exhaustive detection rule)
_SUSPICIOUS_PROCESS_NAMES = {
    "nc", "ncat", "netcat", "nmap", "masscan", "hydra",
    "msfconsole", "msfvenom", "sqlmap", "nikto",
    "tcpdump", "wireshark", "tshark",
}


def collect_metrics() -> SystemMetrics:
    """Gather a full snapshot of system metrics (synchronous)."""
    cpu = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()
    boot_time = psutil.boot_time()
    uptime = time.time() - boot_time

    # Load average (Linux/macOS only)
    try:
        load = psutil.getloadavg()
        load_1, load_5, load_15 = load
    except AttributeError:
        load_1 = load_5 = load_15 = None

    # Disks
    disks = []
    for part in psutil.disk_partitions(all=False):
        try:
            usage = psutil.disk_usage(part.mountpoint)
            disks.append(
                DiskInfo(
                    device=part.device,
                    mountpoint=part.mountpoint,
                    total_gb=round(usage.total / 1e9, 2),
                    used_gb=round(usage.used / 1e9, 2),
                    free_gb=round(usage.free / 1e9, 2),
                    percent=usage.percent,
                )
            )
        except PermissionError:
            pass

    # Network IO
    net_io = psutil.net_io_counters(pernic=True)
    network = [
        NetworkInterfaceInfo(
            name=name,
            bytes_sent=stats.bytes_sent,
            bytes_recv=stats.bytes_recv,
            packets_sent=stats.packets_sent,
            packets_recv=stats.packets_recv,
            errors_in=stats.errin,
            errors_out=stats.errout,
        )
        for name, stats in net_io.items()
    ]

    return SystemMetrics(
        cpu_percent=cpu,
        cpu_count=psutil.cpu_count(logical=True),
        memory_total_gb=round(mem.total / 1e9, 2),
        memory_used_gb=round(mem.used / 1e9, 2),
        memory_percent=mem.percent,
        swap_total_gb=round(swap.total / 1e9, 2),
        swap_used_gb=round(swap.used / 1e9, 2),
        swap_percent=swap.percent,
        disks=disks,
        network=network,
        uptime_seconds=uptime,
        load_avg_1m=load_1,
        load_avg_5m=load_5,
        load_avg_15m=load_15,
    )


def collect_processes(limit: int = 50) -> list[ProcessInfo]:
    """Return top processes sorted by CPU usage."""
    procs = []
    for proc in psutil.process_iter(
        ["pid", "name", "username", "status", "cpu_percent", "memory_info", "cmdline"]
    ):
        try:
            info = proc.info
            name_lower = (info.get("name") or "").lower()
            cmdline = " ".join(info.get("cmdline") or [])[:256]
            suspicious = name_lower in _SUSPICIOUS_PROCESS_NAMES
            reason = f"Known monitoring/hacking tool: {name_lower}" if suspicious else None

            procs.append(
                ProcessInfo(
                    pid=info["pid"],
                    name=info.get("name") or "unknown",
                    username=info.get("username") or "unknown",
                    status=info.get("status") or "unknown",
                    cpu_percent=info.get("cpu_percent") or 0.0,
                    memory_mb=round((info.get("memory_info") or psutil._common.pmem(0, 0)).rss / 1e6, 2),
                    cmdline=cmdline or None,
                    is_suspicious=suspicious,
                    suspicious_reason=reason,
                )
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass

    procs.sort(key=lambda p: p.cpu_percent, reverse=True)
    return procs[:limit]


def collect_open_ports() -> list[OpenPortInfo]:
    """Return listening TCP/UDP ports on the local machine."""
    ports = []
    seen = set()
    for conn in psutil.net_connections(kind="inet"):
        if conn.status not in ("LISTEN", "NONE") and conn.type != 2:  # skip established
            continue
        local = conn.laddr
        if not local:
            continue
        key = (local.port, conn.type)
        if key in seen:
            continue
        seen.add(key)
        proto = "tcp" if conn.type == 1 else "udp"
        proc_name = None
        if conn.pid:
            try:
                proc_name = psutil.Process(conn.pid).name()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        ports.append(
            OpenPortInfo(
                port=local.port,
                protocol=proto,
                local_address=local.ip,
                status=conn.status or "LISTEN",
                pid=conn.pid,
                process_name=proc_name,
            )
        )
    ports.sort(key=lambda p: p.port)
    return ports


def collect_network_connections(limit: int = 100) -> list[NetworkConnectionInfo]:
    """Return active network connections."""
    conns = []
    for conn in psutil.net_connections(kind="inet"):
        if not conn.laddr:
            continue
        remote_addr = conn.raddr.ip if conn.raddr else None
        remote_port = conn.raddr.port if conn.raddr else None
        proc_name = None
        if conn.pid:
            try:
                proc_name = psutil.Process(conn.pid).name()
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        conns.append(
            NetworkConnectionInfo(
                local_address=conn.laddr.ip,
                local_port=conn.laddr.port,
                remote_address=remote_addr,
                remote_port=remote_port,
                status=conn.status or "NONE",
                pid=conn.pid,
                process_name=proc_name,
            )
        )
    return conns[:limit]
