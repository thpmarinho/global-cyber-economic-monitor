/**
 * Dados de Baseline Curados e Constantes de Telemetria OSINT
 */

export const MAX_SERIES_POINTS = 24;
export const MAX_THREAT_LOGS = 25;
export const CACHE_KEY = "gcem_osint_swr_cache_v1";

export const CURATED_OSINT_BASELINE = [
  {
    id: "osint-1",
    agency: "SANS ISC / DShield",
    ip: "185.220.101.42",
    port: 443,
    threatType: "DDoS SYN Flood / Scanner",
    targetSector: "TERCIARIO",
    severity: "ALTA",
    status: "MITIGADO",
  },
  {
    id: "osint-2",
    agency: "Abuse.ch Feodo Tracker",
    ip: "45.142.212.91",
    port: 8080,
    threatType: "Emotet / QakBot C2 Botnet",
    targetSector: "SECUNDARIO",
    severity: "CRÍTICA",
    status: "BLOQUEADO",
  },
  {
    id: "osint-3",
    agency: "CISA KEV Feed",
    ip: "91.240.118.172",
    port: 22,
    threatType: "CVE-2024-3400 Edge Exploit",
    targetSector: "TERCIARIO",
    severity: "CRÍTICA",
    status: "BLOQUEADO",
  },
  {
    id: "osint-4",
    agency: "SANS ISC / DShield",
    ip: "103.145.13.88",
    port: 502,
    threatType: "Modbus OT/SCADA Probe",
    targetSector: "PRIMARIO",
    severity: "ALTA",
    status: "MITIGADO",
  },
  {
    id: "osint-5",
    agency: "Abuse.ch Feodo Tracker",
    ip: "194.26.135.64",
    port: 3389,
    threatType: "Ransomware Brute-Force RDP",
    targetSector: "ONG",
    severity: "MÉDIA",
    status: "BLOQUEADO",
  },
];

export const INITIAL_TIME_SERIES = [
  {
    time: "16:10",
    economicIndex: 104.2,
    cyberAttacksPerMin: 310,
    mitigatedRate: 99.8,
  },
  {
    time: "16:15",
    economicIndex: 105.1,
    cyberAttacksPerMin: 345,
    mitigatedRate: 99.9,
  },
  {
    time: "16:20",
    economicIndex: 104.8,
    cyberAttacksPerMin: 420,
    mitigatedRate: 99.7,
  },
  {
    time: "16:25",
    economicIndex: 106.4,
    cyberAttacksPerMin: 390,
    mitigatedRate: 99.9,
  },
  {
    time: "16:30",
    economicIndex: 107.0,
    cyberAttacksPerMin: 510,
    mitigatedRate: 99.8,
  },
  {
    time: "16:35",
    economicIndex: 108.3,
    cyberAttacksPerMin: 465,
    mitigatedRate: 99.9,
  },
];
