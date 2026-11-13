import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { SecurityBanner } from "./components/SecurityBanner.jsx";
import { Header } from "./components/Header.jsx";
import { FilterControls } from "./components/FilterControls.jsx";
import { KpiCards } from "./components/KpiCards.jsx";
import { AnalyticsCharts } from "./components/AnalyticsCharts.jsx";
import { ThreatLogFeed } from "./components/ThreatLogFeed.jsx";
import { OrganizationsTable } from "./components/OrganizationsTable.jsx";
import { ApiModal } from "./components/ApiModal.jsx";

import { TokenBucketLimiter } from "./security/tokenBucket.js";
import { ApiCircuitBreaker } from "./security/circuitBreaker.js";
import { sanitizeString } from "./security/sanitizer.js";

import { ORGANIZATIONS_DB } from "./data/organizations.js";
import {
  CURATED_OSINT_BASELINE,
  INITIAL_TIME_SERIES,
  MAX_SERIES_POINTS,
} from "./data/osintBaseline.js";
import {
  filterOrganizations,
  calculateSectorSummary,
  calculateKpis,
  generateNextTimeSeriesPoint,
} from "./utils/calculations.js";
import { fetchOsintFeeds } from "./services/osintService.js";

/**
 * Componente Principal do Dashboard Global Cyber & Economic Real-Time Monitor
 */
export default function App() {
  // Filtros de Drill-Down Geoespacial e Setorial
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Telemetria OSINT e Séries Temporais
  const [infoconLevel, setInfoconLevel] = useState("GREEN");
  const [threatLogs, setThreatLogs] = useState(CURATED_OSINT_BASELINE);
  const [timeSeries, setTimeSeries] = useState(INITIAL_TIME_SERIES);
  const [feedSourceStatus, setFeedSourceStatus] = useState("SANS ISC + Abuse.ch (Ativo)");
  const [isSyncing, setIsSyncing] = useState(false);

  // Defesa Ativa e Simulação DDoS
  const [ddosSimulation, setDdosSimulation] = useState(false);
  const [securityMetrics, setSecurityMetrics] = useState({
    circuitState: "CLOSED",
    requestsAccepted: 1420,
    requestsDropped: 18,
    xssBlocked: 4,
    currentRps: 38,
  });

  // Modal de Portabilidade
  const [showApiModal, setShowApiModal] = useState(false);

  // Instâncias persistentes de segurança
  const limiterRef = useRef(new TokenBucketLimiter(90, 30));
  const breakerRef = useRef(new ApiCircuitBreaker(3, 15000));

  // Reset em cascata ao alterar País ou Estado
  const handleCountryChange = useCallback((val) => {
    setSelectedCountry(val);
    setSelectedState("ALL");
    setSelectedCity("ALL");
  }, []);

  const handleStateChange = useCallback((val) => {
    setSelectedState(val);
    setSelectedCity("ALL");
  }, []);

  // Ingestão e sincronização de feeds OSINT com Circuit Breaker e SWR
  const handleRefreshFeeds = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await fetchOsintFeeds({
        circuitBreaker: breakerRef.current,
        currentLogs: threatLogs,
      });

      if (result.infoconLevel) {
        setInfoconLevel(result.infoconLevel);
      }
      setThreatLogs(result.threatLogs);
      setFeedSourceStatus(result.feedSourceStatus);
      setSecurityMetrics((prev) => ({
        ...prev,
        circuitState: result.circuitState,
      }));
    } finally {
      setIsSyncing(false);
    }
  }, [threatLogs]);

  // Polling seguro de feeds externos a cada 30 segundos
  useEffect(() => {
    handleRefreshFeeds();
    const intervalId = setInterval(handleRefreshFeeds, 30000);
    return () => clearInterval(intervalId);
  }, [handleRefreshFeeds]);

  // Streaming contínuo de telemetria econômica e mitigação de rajadas via Token Bucket
  useEffect(() => {
    const streamInterval = setInterval(() => {
      const incomingBurst = ddosSimulation ? 950 : Math.floor(25 + Math.random() * 35);
      let accepted = 0;
      let dropped = 0;
      let xssDetected = 0;

      const sampleChecks = Math.min(incomingBurst, 120);
      for (let i = 0; i < sampleChecks; i++) {
        if (ddosSimulation && i % 9 === 0) {
          const probe = sanitizeString("<script>fetch('http://evil.tld')</script>");
          if (probe.includes("[BLOCKED]") || !probe.includes("<script>")) {
            xssDetected += 1;
          }
        }
        if (limiterRef.current.consume(1)) {
          accepted += 1;
        } else {
          dropped += 1;
        }
      }

      if (incomingBurst > sampleChecks) {
        dropped += incomingBurst - sampleChecks;
      }

      setSecurityMetrics((prev) => ({
        ...prev,
        requestsAccepted: prev.requestsAccepted + accepted,
        requestsDropped: prev.requestsDropped + dropped,
        xssBlocked: prev.xssBlocked + xssDetected,
        currentRps: incomingBurst,
      }));

      // Atualização de buffer circular seguro
      const now = new Date();
      const timeLabel = now.toTimeString().slice(0, 8);
      setTimeSeries((prev) => {
        const last = prev[prev.length - 1];
        const nextPoint = generateNextTimeSeriesPoint(last, ddosSimulation, timeLabel);
        return [...prev.slice(-(MAX_SERIES_POINTS - 1)), nextPoint];
      });
    }, 2200);

    return () => clearInterval(streamInterval);
  }, [ddosSimulation]);

  // Entidades filtradas
  const filteredOrgs = useMemo(() => {
    return filterOrganizations(ORGANIZATIONS_DB, {
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      sector: selectedSector,
      searchTerm,
    });
  }, [selectedCountry, selectedState, selectedCity, selectedSector, searchTerm]);

  // Agregações de gráficos e KPIs
  const sectorSummaryData = useMemo(() => calculateSectorSummary(filteredOrgs), [filteredOrgs]);
  const kpis = useMemo(() => calculateKpis(filteredOrgs, ddosSimulation), [filteredOrgs, ddosSimulation]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <SecurityBanner
        securityMetrics={securityMetrics}
        ddosSimulation={ddosSimulation}
        onToggleDdos={() => setDdosSimulation((prev) => !prev)}
        onOpenApiModal={() => setShowApiModal(true)}
      />

      <Header
        feedSourceStatus={feedSourceStatus}
        infoconLevel={infoconLevel}
        isSyncing={isSyncing}
        onRefreshFeeds={handleRefreshFeeds}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <FilterControls
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          selectedCity={selectedCity}
          selectedSector={selectedSector}
          searchTerm={searchTerm}
          onCountryChange={handleCountryChange}
          onStateChange={handleStateChange}
          onCityChange={setSelectedCity}
          onSectorChange={setSelectedSector}
          onSearchChange={setSearchTerm}
        />

        <KpiCards kpis={kpis} />

        <AnalyticsCharts
          timeSeries={timeSeries}
          sectorSummaryData={sectorSummaryData}
        />

        <section aria-label="Ameaças e Organizações" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <ThreatLogFeed threatLogs={threatLogs} />
          <OrganizationsTable organizations={filteredOrgs} />
        </section>
      </main>

      <ApiModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
      />
    </div>
  );
}
