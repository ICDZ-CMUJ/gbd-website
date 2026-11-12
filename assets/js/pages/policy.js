/* Policy Corner — wykres zróżnicowania wojewódzkiego (DANE PRZYKŁADOWE) i drukowanie szablonu. */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const C = window.GBDCharts;

    /* Standaryzowany współczynnik umieralności CVD na 100 tys. — wartości z ilustracji koncepcji */
    const rows = [
      { label: "Małopolskie", value: 195 },
      { label: "Pomorskie", value: 210 },
      { label: "Mazowieckie", value: 225 },
      { label: "Polska (średnia)", value: 250, avg: true },
      { label: "Śląskie", value: 270 },
      { label: "Łódzkie", value: 300 },
      { label: "Lubelskie", value: 320 }
    ];
    const scale = C.colorScale(rows.filter(r => !r.avg).map(r => r.value), true);
    C.hbars(document.getElementById("cvd-bars"), rows.map(r => ({
      label: r.label, value: r.value, bold: r.avg,
      color: r.avg ? "#9aa1ab" : scale(r.value)
    })), { max: 340 });

    /* Drukowanie wyłącznie szablonu briefu */
    const btn = document.getElementById("print-brief");
    if (btn) btn.addEventListener("click", () => {
      document.body.classList.add("printing-brief");
      const done = () => { document.body.classList.remove("printing-brief"); window.removeEventListener("afterprint", done); };
      window.addEventListener("afterprint", done);
      window.print();
      setTimeout(done, 1000);
    });
  });
})();
