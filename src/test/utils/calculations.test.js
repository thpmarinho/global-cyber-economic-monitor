import { describe, it, expect } from "vitest";
import {
  filterOrganizations,
  calculateSectorSummary,
  calculateKpis,
  generateNextTimeSeriesPoint,
} from "../../utils/calculations.js";
import { ORGANIZATIONS_DB } from "../../data/organizations.js";

/**
 * Suíte de Testes: Regras de Negócio, Agregações e Filtros
 * Técnicas aplicadas:
 * - Particionamento em Classes de Equivalência (EP)
 * - Análise do Valor Limite (BVA)
 */
describe("Calculations & Business Logic Module", () => {
  describe("filterOrganizations() - Filtros Geográficos & Setoriais", () => {
    it("deve retornar todas as organizações quando os filtros estiverem em 'ALL'", () => {
      const result = filterOrganizations(ORGANIZATIONS_DB, {
        country: "ALL",
        state: "ALL",
        city: "ALL",
        sector: "ALL",
        searchTerm: "",
      });
      expect(result.length).toBe(ORGANIZATIONS_DB.length);
    });

    it("deve filtrar estritamente por País (BR)", () => {
      const result = filterOrganizations(ORGANIZATIONS_DB, { country: "BR" });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((org) => expect(org.country).toBe("BR"));
    });

    it("deve filtrar por hierarquia Estado e Cidade (SP -> São Paulo)", () => {
      const result = filterOrganizations(ORGANIZATIONS_DB, {
        country: "BR",
        state: "SP",
        city: "São Paulo",
      });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((org) => {
        expect(org.country).toBe("BR");
        expect(org.state).toBe("SP");
        expect(org.city).toBe("São Paulo");
      });
    });

    it("deve filtrar por Setor Econômico (ex: ONG)", () => {
      const result = filterOrganizations(ORGANIZATIONS_DB, {
        sector: "ONG",
      });
      expect(result.length).toBeGreaterThan(0);
      result.forEach((org) => expect(org.sector).toBe("ONG"));
    });

    it("deve realizar busca textual case-insensitive por nome, segmento ou cidade", () => {
      const resultByName = filterOrganizations(ORGANIZATIONS_DB, {
        searchTerm: "petrobras",
      });
      expect(resultByName.some((o) => o.name.includes("Petrobras"))).toBe(true);

      const resultBySegment = filterOrganizations(ORGANIZATIONS_DB, {
        searchTerm: "semicondutores",
      });
      expect(resultBySegment.length).toBe(1);
      expect(resultBySegment[0].name).toContain("NVIDIA");

      const resultByCity = filterOrganizations(ORGANIZATIONS_DB, {
        searchTerm: "manaus",
      });
      expect(resultByCity.length).toBe(2);
    });

    it("deve retornar lista vazia quando nenhum registro coincidir com o filtro", () => {
      const result = filterOrganizations(ORGANIZATIONS_DB, {
        searchTerm: "InexistenteXYZ123",
      });
      expect(result).toEqual([]);
    });

    it("deve ser tolerante a entradas nulas ou vazias", () => {
      expect(filterOrganizations(null, {})).toEqual([]);
      expect(filterOrganizations(undefined, {})).toEqual([]);
      expect(filterOrganizations([null, undefined], {})).toEqual([]);
    });
  });

  describe("calculateSectorSummary()", () => {
    it("deve agregar os volumes e bloqueios por setor sem erro cumulativo de ponto flutuante", () => {
      const summary = calculateSectorSummary(ORGANIZATIONS_DB);

      expect(summary).toHaveLength(4);
      const primario = summary.find((s) => s.setor.includes("Primário"));
      const secundario = summary.find((s) => s.setor.includes("Secundário"));
      const terciario = summary.find((s) => s.setor.includes("Terciário"));
      const ong = summary.find((s) => s.setor.includes("Terceiro Setor"));

      expect(primario).toBeDefined();
      expect(secundario).toBeDefined();
      expect(terciario).toBeDefined();
      expect(ong).toBeDefined();

      expect(primario.volumeBi).toBe(24.6);
      expect(primario.bloqueiosMil).toBe(0.89);
    });

    it("deve retornar valores zerados para lista vazia (BVA)", () => {
      const summary = calculateSectorSummary([]);
      summary.forEach((s) => {
        expect(s.volumeBi).toBe(0);
        expect(s.bloqueiosMil).toBe(0);
      });
    });
  });

  describe("calculateKpis()", () => {
    it("deve calcular a consolidação de volume, ataques e riscos críticos", () => {
      const kpis = calculateKpis(ORGANIZATIONS_DB, false);

      expect(kpis.entitiesCount).toBe(ORGANIZATIONS_DB.length);
      expect(kpis.rawVolume).toBeGreaterThan(0);
      expect(kpis.rawBlocked).toBeGreaterThan(0);
      expect(kpis.highRiskCount).toBeGreaterThan(0);
    });

    it("deve somar bloqueios simulados quando ddosSimulation estiver ativo", () => {
      const normalKpis = calculateKpis(ORGANIZATIONS_DB, false);
      const ddosKpis = calculateKpis(ORGANIZATIONS_DB, true);

      expect(ddosKpis.rawBlocked).toBe(normalKpis.rawBlocked + 14820);
    });

    it("deve lidar corretamente com lista vazia de organizações (BVA)", () => {
      const kpis = calculateKpis([]);
      expect(kpis.entitiesCount).toBe(0);
      expect(kpis.rawVolume).toBe(0);
      expect(kpis.rawBlocked).toBe(0);
      expect(kpis.highRiskCount).toBe(0);
      expect(kpis.totalVolume).toBe("0,0");
      expect(kpis.totalBlocked).toBe("0");
    });
  });

  describe("generateNextTimeSeriesPoint()", () => {
    it("deve gerar próximo ponto respeitando os limites da série econômica (92 a 135)", () => {
      const prev = { economicIndex: 100.0, cyberAttacksPerMin: 300 };
      const next = generateNextTimeSeriesPoint(prev, false, "12:00:00");

      expect(next.time).toBe("12:00:00");
      expect(next.economicIndex).toBeGreaterThanOrEqual(92);
      expect(next.economicIndex).toBeLessThanOrEqual(135);
      expect(next.cyberAttacksPerMin).toBeGreaterThanOrEqual(310);
      expect(next.mitigatedRate).toBe(99.89);
    });

    it("deve elevar os ataques por minuto durante simulação DDoS", () => {
      const prev = { economicIndex: 100.0, cyberAttacksPerMin: 300 };
      const next = generateNextTimeSeriesPoint(prev, true, "12:00:00");

      expect(next.cyberAttacksPerMin).toBeGreaterThanOrEqual(1850);
      expect(next.mitigatedRate).toBe(99.94);
    });
  });
});
