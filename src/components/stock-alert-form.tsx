"use client";

import * as React from "react";
import { Plus, Loader2, AlertCircle, ArrowDown, ArrowUp, Tag, ChevronUp, ChevronDown, Check } from "lucide-react";
import { createStockAlert, ActionResponse } from "@/app/actions";
import { searchB3Stocks, B3StockItem } from "@/lib/b3-stocks";

export function StockAlertForm() {
  const [ticker, setTicker] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [minPrice, setMinPrice] = React.useState("");
  const [maxPrice, setMaxPrice] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<B3StockItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [state, setState] = React.useState<ActionResponse | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const formRef = React.useRef<HTMLFormElement>(null);
  const inputContainerRef = React.useRef<HTMLDivElement>(null);

  // Fecha o dropdown se clicar fora
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputContainerRef.current &&
        !inputContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTickerChange = (value: string) => {
    const upper = value.toUpperCase();
    setTicker(upper);

    if (upper.trim().length >= 1) {
      const results = searchB3Stocks(upper);
      setSuggestions(results);
      setIsDropdownOpen(results.length > 0);

      const exact = results.find((r) => r.ticker === upper);
      if (exact) {
        setCompanyName(exact.name);
      } else {
        setCompanyName("");
      }
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setCompanyName("");
    }
  };

  const selectStock = (stock: B3StockItem) => {
    setTicker(stock.ticker);
    setCompanyName(stock.name);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await createStockAlert(null, formData);
      setState(res);
      if (res?.success) {
        formRef.current?.reset();
        setTicker("");
        setCompanyName("");
        setMinPrice("");
        setMaxPrice("");
        setTimeout(() => setState(null), 3000);
      }
    });
  };

  const adjustPrice = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    currentVal: string,
    delta: number
  ) => {
    const num = parseFloat(currentVal) || 0;
    const next = Math.max(0, num + delta);
    setter(next > 0 ? next.toFixed(2) : "");
  };

  return (
    <section className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 mb-5 border-b border-border-light dark:border-border-dark">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground-light dark:text-foreground-dark">
            Novo Monitoramento
          </h2>
          <p className="text-xs text-muted-light dark:text-muted-dark mt-0.5">
            Pesquise pelo ticker ou nome da empresa e defina sua meta de preço.
          </p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {state?.error && (
          <div className="flex items-center gap-2 p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state?.success && (
          <div className="flex items-center gap-2 p-3 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg">
            <span>Alerta cadastrado com sucesso! Monitoramento ativo.</span>
          </div>
        )}

        {/* Input escondido com o nome da empresa */}
        <input type="hidden" name="company_name" value={companyName} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ticker Input com Autocomplete Dinâmico */}
          <div ref={inputContainerRef} className="space-y-1.5 relative">
            <label
              htmlFor="ticker"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground-light dark:text-foreground-dark"
            >
              <Tag className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
              <span>Código do Ativo</span>
            </label>

            <div className="relative">
              <input
                id="ticker"
                name="ticker"
                type="text"
                required
                maxLength={7}
                autoComplete="off"
                placeholder="ex: PETR4"
                value={ticker}
                onChange={(e) => handleTickerChange(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setIsDropdownOpen(true);
                }}
                className="w-full px-3 py-2 text-sm font-mono uppercase placeholder:normal-case bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition"
              />

              {/* Menu Flutuante de Sugestões de Ações B3 */}
              {isDropdownOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-[#18181B] border border-border-light dark:border-border-dark rounded-xl shadow-xl overflow-hidden py-1 divide-y divide-border-light dark:divide-border-dark animate-in fade-in zoom-in-95">
                  {suggestions.map((stock) => (
                    <button
                      key={stock.ticker}
                      type="button"
                      onClick={() => selectStock(stock)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-surface-light dark:hover:bg-zinc-800/80 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground-light dark:text-foreground-dark group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {stock.ticker}
                          </span>
                          <span className="text-[11px] text-foreground-light dark:text-foreground-dark font-medium">
                            {stock.name}
                          </span>
                        </div>
                        {stock.sector && (
                          <span className="text-[10px] text-muted-light dark:text-muted-dark mt-0.5">
                            {stock.sector}
                          </span>
                        )}
                      </div>
                      {ticker === stock.ticker && (
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preço Mínimo */}
          <div className="space-y-1.5">
            <label
              htmlFor="target_min_price"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground-light dark:text-foreground-dark"
            >
              <ArrowDown className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
              <span>Preço Mínimo</span>
              <span className="text-[11px] font-normal text-muted-light dark:text-muted-dark">
                &bull; R$
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                id="target_min_price"
                name="target_min_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="ex: 35.50"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full pl-3 pr-7 py-2 text-sm font-mono bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-1 flex flex-col">
                <button
                  type="button"
                  onClick={() => adjustPrice(setMinPrice, minPrice, 0.5)}
                  className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                  tabIndex={-1}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustPrice(setMinPrice, minPrice, -0.5)}
                  className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                  tabIndex={-1}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Preço Máximo */}
          <div className="space-y-1.5">
            <label
              htmlFor="target_max_price"
              className="flex items-center gap-1.5 text-xs font-medium text-foreground-light dark:text-foreground-dark"
            >
              <ArrowUp className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark" />
              <span>Preço Máximo</span>
              <span className="text-[11px] font-normal text-muted-light dark:text-muted-dark">
                &bull; R$
              </span>
            </label>
            <div className="relative flex items-center">
              <input
                id="target_max_price"
                name="target_max_price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="ex: 42.00"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full pl-3 pr-7 py-2 text-sm font-mono bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg text-foreground-light dark:text-foreground-dark placeholder:text-muted-light dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div className="absolute right-1 flex flex-col">
                <button
                  type="button"
                  onClick={() => adjustPrice(setMaxPrice, maxPrice, 0.5)}
                  className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                  tabIndex={-1}
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustPrice(setMaxPrice, maxPrice, -0.5)}
                  className="p-0.5 text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark transition"
                  tabIndex={-1}
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé: apenas o aviso obrigatório e o botão de ação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-[11px] text-muted-light dark:text-muted-dark">
            * Informe ao menos um dos limites.
          </p>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 rounded-lg disabled:opacity-50 transition shadow-sm shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Alerta</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
