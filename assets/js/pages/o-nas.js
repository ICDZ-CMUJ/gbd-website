/* O nas — karty zespołu (placeholdery do uzupełnienia) */
(function () {
  "use strict";
  const TEAM = [
    { initials: "AB", tone: "blue",   role: "Kierownik Hubu" },
    { initials: "CD", tone: "coral",  role: "Epidemiologia i analizy GBD" },
    { initials: "EF", tone: "green",  role: "Analiza danych i dashboardy" },
    { initials: "GH", tone: "purple", role: "Analizy CEE" },
    { initials: "IJ", tone: "amber",  role: "Komunikacja i policy briefs" },
    { initials: "KL", tone: "blue",   role: "Edukacja i materiały dydaktyczne" }
  ];
  const BG = { blue: ["var(--ncd-tint)", "var(--ncd-dark)"], coral: ["var(--coral-tint)", "var(--coral-dark)"], green: ["var(--inj-tint)", "var(--inj-dark)"], purple: ["var(--purple-tint)", "var(--purple-dark)"], amber: ["var(--amber-tint)", "var(--amber-dark)"] };

  document.addEventListener("DOMContentLoaded", () => {
    const host = document.getElementById("team");
    if (!host) return;
    host.innerHTML = TEAM.map(p => `
      <article class="card person">
        <div class="avatar" style="background:${BG[p.tone][0]};color:${BG[p.tone][1]}" aria-hidden="true">${p.initials}</div>
        <div><h3>[Imię i nazwisko]</h3><div class="role">${p.role}</div><div class="aff">[Afiliacja — jednostka, instytucja]</div></div>
        <p>[Krótki biogram, 3–4 zdania: wykształcenie, obszar badań, doświadczenie z danymi GBD, rola w Hubie.]</p>
        <div class="links"><a href="https://orcid.org/" rel="noopener" target="_blank">ORCID ↗</a><a href="#zespol">Profil instytucjonalny</a></div>
      </article>`).join("");
  });
})();
