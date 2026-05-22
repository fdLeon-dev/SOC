"""DefenseOS - System Metrics Schema (no DB model — live data)."""
from typing import Optional
from pydantic import BaseModel


class DiskInfo(BaseModel):
    device: str
    mountpoint: str
    total_gb: float
    used_gb: float
    free_gb: float
    percent: float


class NetworkInterfaceInfo(BaseModel):
    name: str
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    errors_in: int
    errors_out: int


class SystemMetrics(BaseModel):
    cpu_percent: float
    cpu_count: int
    memory_total_gb: float
    memory_used_gb: float
    memory_percent: float
    swap_total_gb: float
    swap_used_gb: float
    swap_percent: float
    disks: list[DiskInfo]
    network: list[NetworkInterfaceInfo]
    uptime_seconds: float
    load_avg_1m: Optional[float] = None
    load_avg_5m: Optional[float] = None
    load_avg_15m: Optional[float] = None


class ProcessInfo(BaseModel):
    pid: int
    name: str
    username: str
    status: str
    cpu_percent: float
    memory_mb: float
    cmdline: Optional[str] = None
    is_suspicious: bool = False
    suspicious_reason: Optional[str] = None


class OpenPortInfo(BaseModel):
    port: int
    protocol: str
    local_address: str
    status: str
    pid: Optional[int] = None
    process_name: Optional[str] = None


class NetworkConnectionInfo(BaseModel):
    local_address: str
    local_port: int
    remote_address: Optional[str] = None
    remote_port: Optional[int] = None
    status: str
    pid: Optional[int] = None
    process_name: Optional[str] = None
