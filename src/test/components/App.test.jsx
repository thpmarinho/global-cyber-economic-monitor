import { describe, it, expect, vi, beforeEach } from "vitest";
import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App.jsx";

/**
 * Suíte de Testes: Integração de Componentes e Interface do Usuário
 * Técnicas aplicadas:
 * - Testes de Componentes (React Testing Library)
 * - Simulação de Eventos do Usuário (User Events)
 * - Testes de Acessibilidade e Integridade de Interface
 */
describe("App Component (Integration & UI)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url) => {
        if (url.includes("infocon")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: "green" }),
          });
        }
        if (url.includes("topips")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
        }
        return Promise.reject(new Error("Unknown URL"));
      })
    );
  });

  it("deve renderizar o título do dashboard e os elementos principais", async () => {
    await act(async () => {
      render(<App />);
    });

    expect(
      screen.getByText("Global Cyber & Economic Real-Time Monitor")
    ).toBeInTheDocument();
    expect(screen.getByTestId("kpi-volume")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-blocked")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-critical")).toBeInTheDocument();
  });

  it("deve aplicar drill-down geográfico em cascata ao selecionar um País", async () => {
    await act(async () => {
      render(<App />);
    });

    const countrySelect = screen.getByTestId("select-country");
    const stateSelect = screen.getByTestId("select-state");
    const citySelect = screen.getByTestId("select-city");

    // Inicialmente estados e cidades estão desabilitados porque o país é ALL
    expect(stateSelect).toBeDisabled();
    expect(citySelect).toBeDisabled();

    // Seleciona Brasil (BR)
    await act(async () => {
      fireEvent.change(countrySelect, { target: { value: "BR" } });
    });

    // Estado agora deve estar habilitado
    expect(stateSelect).not.toBeDisabled();
    expect(citySelect).toBeDisabled();

    // Seleciona São Paulo (SP)
    await act(async () => {
      fireEvent.change(stateSelect, { target: { value: "SP" } });
    });
    expect(citySelect).not.toBeDisabled();

    // Verifica que a tabela filtrou as organizações para SP
    const rows = screen.getAllByTestId("org-row");
    expect(rows.length).toBeGreaterThan(0);
  });

  it("deve filtrar organizações ao digitar no campo de busca", async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<App />);
    });

    const searchInput = screen.getByTestId("search-input");
    await act(async () => {
      await user.type(searchInput, "B3");
    });

    // Deve exibir apenas a B3
    const rows = screen.getAllByTestId("org-row");
    expect(rows.length).toBe(1);
    expect(screen.getByText(/B3 S.A./i)).toBeInTheDocument();
  });

  it("deve alternar a simulação de ataque DDoS ao clicar no botão", async () => {
    await act(async () => {
      render(<App />);
    });

    const ddosButton = screen.getByRole("button", { name: /Simular Ataque DDoS/i });
    expect(ddosButton).toBeInTheDocument();

    // Clica para iniciar simulação
    await act(async () => {
      fireEvent.click(ddosButton);
    });

    expect(
      screen.getByRole("button", { name: /Parar Ataque DDoS/i })
    ).toBeInTheDocument();

    // Clica novamente para desativar
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Parar Ataque DDoS/i }));
    });
    expect(
      screen.getByRole("button", { name: /Simular Ataque DDoS/i })
    ).toBeInTheDocument();
  });

  it("deve abrir e fechar o Modal de Arquitetura & API", async () => {
    await act(async () => {
      render(<App />);
    });

    const openModalBtn = screen.getByRole("button", {
      name: /Abrir documentação de API e arquitetura/i,
    });
    await act(async () => {
      fireEvent.click(openModalBtn);
    });

    // Modal deve estar visível
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByText(/Portabilidade de API & Gateway de Ingestão/i)
    ).toBeInTheDocument();

    // Fecha clicando no botão fechar
    const closeBtn = screen.getByRole("button", { name: /Fechar Documentação/i });
    await act(async () => {
      fireEvent.click(closeBtn);
    });

    // Modal deve ter desaparecido
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
