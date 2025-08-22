import React, { useMemo, useState } from "react";

/* ----------------------- Helpers ----------------------- */
const safeNum = (v) => {
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
  return isFinite(n) ? n : 0;   // ✅ use global isFinite
};


const fmtINR = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeNum(v));

const numToIndianWords = (num) => {
  const n = Math.round(safeNum(num));
  if (n === 0) return "Zero Rupees Only";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const two = (x) =>
    (x < 20
      ? ones[x]
      : `${tens[Math.floor(x / 10)]}${x % 10 ? ` ${ones[x % 10]}` : ""}`
    ).trim();
  const parts = {
    crore: Math.floor(n / 10000000),
    lakh: Math.floor((n % 10000000) / 100000),
    thousand: Math.floor((n % 100000) / 1000),
    hundred: Math.floor((n % 1000) / 100),
    rest: n % 100,
  };
  const segs = [];
  if (parts.crore) segs.push(two(parts.crore) + " Crore");
  if (parts.lakh) segs.push(two(parts.lakh) + " Lakh");
  if (parts.thousand) segs.push(two(parts.thousand) + " Thousand");
  if (parts.hundred) segs.push(ones[parts.hundred] + " Hundred");
  if (parts.rest) segs.push(two(parts.rest));
  return `${segs.join(" ")} Rupees Only`.replace(/\s+/g, " ").trim();
};

/* ----------------------- Main Component ----------------------- */
export default function QuotationMaker() {
  const todayStr = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, []);

  const [state, setState] = useState(() => ({
    company: {
      name: "TECH AD India Network Solutions",
      gst: "09AAUFTS800DZP",
      logoUrl: "https://techad.in/wp-content/uploads/2025/03/Banner-Idea--300x81.png",
      address1:
        "Head Office: 65A, 6th Floor, Devika Tower, Nehru Place, New Delhi 110019",
      address2:
        "Regd. Office: Top Floor, Plot No D-4, Sector-2, Chiranjeev Vihar, Shastri Nagar, Ghaziabad, Uttar Pradesh 201002",
      phone: "+91 77620 49680",
      email: "sales@techad.in",
      website: "www.techad.in",
    },
    quotation: {
      number: "TAINS/Q/26-26/001",
      date: todayStr,
      subject: "Quotation for Apple devices",
      toCompany: "Company Name",
      toAddress: "Address line 1, City, State - PIN",
      greeting: "Dear Sir/Madam,",
      message:
        "I hope this finds you well. This is in response to our discussion with your team regarding Apple product requirements. The following are the details of the quote we have prepared for you.",
    },
    items: [
      {
        name: "Apple Studio Display with Tilt Adjustable Stand",
        description: "27-inch 5K Retina, P3 wide color, 600 nits",
        qty: 1,
        rate: 129900,
      },
      {
        name: "Apple MacBook Pro 14-inch M4 Max (16c CPU / 40c GPU)",
        description: "32GB unified memory, 1TB SSD, 96W USB-C power adapter",
        qty: 5,
        rate: 213900,
      },
      {
        name: "Apple Magic Mouse",
        description: "Multi-touch surface, Bluetooth",
        qty: 6,
        rate: 7600,
      },
      {
        name: "Apple iMac 24-inch M4 (10-core)",
        description: "Retina 4.5K, 16GB/512GB",
        qty: 3,
        rate: 357750,
      },
    ],
    charges: { discount: 0, shipping: 0, gstPercent: 18 },
    terms: [
      "Payment Terms: 100% Advance along with PO",
      "Order Cancellation: Orders once placed cannot be canceled",
      "Delivery: 7–15 working days from date of order",
      "Prices quoted are as per quantity mentioned",
    ],
    signatory: {
      name: "Alok Kumar",
      designation: "Sales Manager",
      mobile: "+91 9999999999",
      email: "sales@techad.in",
    },
  }));

  /* ----------------------------- Totals (parent) ----------------------------- */
  const subTotal = useMemo(
    () =>
      state.items.reduce((s, it) => s + safeNum(it.qty) * safeNum(it.rate), 0),
    [state.items],
  );
  const discountAmt = safeNum(state.charges.discount);
  const shippingAmt = safeNum(state.charges.shipping);
  const gstPercent = safeNum(state.charges.gstPercent);
  const taxable = Math.max(0, subTotal - discountAmt + shippingAmt);
  const gstAmt = (taxable * gstPercent) / 100;
  const grandTotal = taxable + gstAmt;

  /* ------------------------------ Helpers --------------------------- */
  const update = (path, value) => {
    setState((prev) => {
      // safe deep-clone (works for JSON-able state)
      const clone = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let ref = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
        if (ref === undefined) break;
      }
      if (ref) ref[keys.at(-1)] = value;
      return clone;
    });
  };

  const changeItem = (idx, field, value) =>
    setState((prev) => {
      const items = prev.items.map((it, i) =>
        i === idx ? { ...it, [field]: value } : it,
      );
      return { ...prev, items };
    });

  const addItem = () =>
    setState((p) => ({
      ...p,
      items: [...p.items, { name: "", description: "", qty: 1, rate: 0 }],
    }));
  const removeItem = (idx) =>
    setState((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  const addTerm = () => setState((p) => ({ ...p, terms: [...p.terms, ""] }));
  const removeTerm = (idx) =>
    setState((p) => ({ ...p, terms: p.terms.filter((_, i) => i !== idx) }));

  const handlePrint = () => window.print();

  const autoNumber = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 900 + 100);
    return `TAINS/Q/${yyyy}${mm}${dd}/${rand}`;
  };

  /* -------------------------------- UI -------------------------------- */
  return (
    <div className="min-h-screen bg-slate-100">
      <style>{`
        :root{
          --headerH: 36mm;
          --footerH: 26mm;
          --screenPadTop: 8mm;
          --screenPadBottom: 8mm;
          --max-rows-per-page: 7;
        }

        @page {
          size: A4;
          margin: var(--headerH) 12mm var(--footerH) 12mm;
        }

        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { background: white; height: auto; }
          .no-print { display: none !important; }

          .print-header, .print-footer { position: fixed; left: 0; right: 0; z-index: 9999; }
          .print-header { top: 0; height: var(--headerH); }
          .print-footer { bottom: 0; height: var(--footerH); }

          /* Each .print-page becomes a printed page; table headers repeat because each page contains a table head */
          .print-page { page-break-after: always; break-after: page; padding: 0 12mm; box-sizing: border-box; }
          .print-page:last-child { page-break-after: auto; break-after: auto; }

          table { border-collapse: collapse; width: 100%; table-layout: fixed; }
          thead { display: table-header-group; }
          tr, th, td { page-break-inside: avoid; break-inside: avoid; }
          .final-section { page-break-inside: avoid; break-inside: avoid; }

          .items-table th, .items-table td { padding: 6px 8px; font-size: 11px; line-height: 1.2; }
          .items-table .desc { font-size: 10px; color: #444; }

          /* Tight totals box */
          .totals-box { padding: 8px; font-size: 12px; }
        }

        /* Screen preview: make room so header/footer do not cover the content */
        .page { width: 210mm; min-height: 297mm; }
        .print-header { height: var(--headerH); }
        .print-footer { height: var(--footerH); }
        .content {
          margin-top: calc(var(--headerH) + var(--screenPadTop));
          margin-bottom: calc(var(--footerH) + var(--screenPadBottom));
        }

        /* small helper for two-line descriptions on print */
        @media print {
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        /* Visual preview styles (non-print) */
        .page-preview { background: white; border-radius: 8px; overflow: visible; }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="size-9 grid place-items-center rounded-xl bg-blue-600 text-white font-bold">
            Q
          </div>
          <div className="font-semibold">Quotation Maker</div>
          <div className="ms-auto flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow"
            >
              Print / Save PDF
            </button>
            <button
              onClick={() =>
                setState((s) => ({
                  ...s,
                  quotation: {
                    ...s.quotation,
                    number: autoNumber(),
                    date: todayStr,
                  },
                }))
              }
              className="px-3 py-1.5 rounded-lg border"
            >
              New Number
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-[360px,1fr] gap-4">
        {/* Left form */}
        <div className="no-print lg:sticky lg:top-16 h-fit">
          <FormPanel
            state={state}
            update={update}
            changeItem={changeItem}
            addItem={addItem}
            removeItem={removeItem}
            addTerm={addTerm}
            removeTerm={removeTerm}
            fmtINR={fmtINR}
          />
        </div>

        {/* Right: printable preview */}
        <div className="page page-preview bg-white shadow-xl rounded-xl relative">
          <PrintHeader company={state.company} quotation={state.quotation} />

          <div className="content px-8 py-6">
            <PrintableBody
              state={state}
              subTotal={subTotal}
              discountAmt={discountAmt}
              shippingAmt={shippingAmt}
              gstAmt={gstAmt}
              taxable={taxable}
              grandTotal={grandTotal}
              amountInWords={numToIndianWords(grandTotal)}
              fmtINR={fmtINR}
            />
          </div>

          <PrintFooter company={state.company} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Print pieces ------------------------- */

function PrintHeader({ company, quotation }) {
  return (
    <div className="print-header bg-blue-700 text-white">
      <div className="px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="logo"
              className="h-10 w-auto rounded-sm bg-white p-1"
            />
          ) : (
            <div className="h-10 w-16 rounded-sm bg-white/10 grid place-items-center text-xs font-semibold">
              LOGO
            </div>
          )}
          <div>
            <div className="text-lg font-bold leading-tight">
              {company.name}
            </div>
            <div className="text-[11px] opacity-90">GST No: {company.gst}</div>
          </div>
        </div>
        <div className="text-right text-[12px] leading-tight">
          <div className="font-semibold tracking-wide">QUOTATION</div>
          <div>Quotation No: {quotation.number}</div>
          <div>Date: {quotation.date}</div>
        </div>
      </div>
    </div>
  );
}

function PrintFooter({ company }) {
  return (
    <div className="print-footer bg-red-600 text-white">
      <div className="px-8 py-3 h-full flex items-center justify-between text-[10px] leading-tight">
        <div className="max-w-[65%]">
          <div>{company.address1}</div>
          <div>{company.address2}</div>
        </div>
        <div className="text-right">
          <div>{company.phone}</div>
          <div>{company.email}</div>
          <div>{company.website}</div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Body (handles pagination) ----------------------- */

function PrintableBody({
  state,
  subTotal,
  discountAmt,
  shippingAmt,
  gstAmt,
  taxable,
  grandTotal,
  amountInWords,
  fmtINR,
}) {
  const { quotation, items, charges, terms, signatory } = state;

  // Split items into pages of max 7 rows (client requested "not more than 7")
  const MAX_ROWS = 7;
  const pages = [];
  for (let i = 0; i < items.length; i += MAX_ROWS) {
    pages.push(items.slice(i, i + MAX_ROWS));
  }
  if (pages.length === 0) pages.push([]); // ensure at least one page

  return (
    <>
      {pages.map((pageItems, pageIndex) => (
        <div key={pageIndex} className="print-page">
          {/* Recipient & subject on first page only */}
          {pageIndex === 0 && (
            <div className="text-[12px] text-slate-700 space-y-1.5 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-slate-700">
                  <div>
                    <span className="font-semibold">To:</span>{" "}
                    {quotation.toCompany}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {quotation.toAddress}
                  </div>
                </div>
                <div className="text-right font-medium">
                  {quotation.subject}
                </div>
              </div>
              <div>{quotation.greeting}</div>
              <div>{quotation.message}</div>
            </div>
          )}

          {/* Items table (each page has the table header so printed pages show headings) */}
          <table className="items-table w-full border">
            <colgroup>
              <col style={{ width: "12mm" }} />
              <col />
              <col style={{ width: "28mm" }} />
              <col style={{ width: "16mm" }} />
              <col style={{ width: "32mm" }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-100">
                <th className="border text-center">S. No</th>
                <th className="border text-left">Item Description</th>
                <th className="border text-right">Rate</th>
                <th className="border text-center">Qty</th>
                <th className="border text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((it, idx) => {
                const globalIndex = pageIndex * MAX_ROWS + idx;
                return (
                  <tr key={globalIndex} className="align-top">
                    <td className="border text-center p-2">
                      {globalIndex + 1}
                    </td>
                    <td className="border p-2">
                      <div className="font-medium">
                        {it.name || (
                          <span className="text-slate-400">Item name</span>
                        )}
                      </div>
                      {it.description ? (
                        <div className="desc line-clamp-2 mt-0.5 text-slate-500">
                          {it.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="border p-2 text-right">{fmtINR(it.rate)}</td>
                    <td className="border p-2 text-center">
                      {safeNum(it.qty)}
                    </td>
                    <td className="border p-2 text-right">
                      {fmtINR(safeNum(it.qty) * safeNum(it.rate))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* On last page, show totals, terms, signoff — kept together by .final-section */}
          {pageIndex === pages.length - 1 && (
            <div className="final-section mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div />
                <div className="ms-auto w-full max-w-sm rounded-lg border totals-box">
                  <div className="flex justify-between">
                    <span>Taxable</span>
                    <span>{fmtINR(taxable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({charges.gstPercent || 0}%)</span>
                    <span>{fmtINR(gstAmt)}</span>
                  </div>
                  <div className="border-t mt-1 pt-1 font-semibold flex justify-between text-base">
                    <span>Grand Total</span>
                    <span>{fmtINR(grandTotal)}</span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-600 italic">
                    Amount in words: {amountInWords}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-semibold mb-2">Terms:</div>
                <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                  {terms.map((t, i) => (
                    <li key={i}>
                      {t || <span className="text-slate-400">(empty)</span>}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 text-sm">
                <div>Best regards,</div>
                <div className="mt-2 font-semibold">{signatory.name}</div>
                <div className="text-slate-600">{signatory.designation}</div>
                <div className="text-slate-600">Mobile: {signatory.mobile}</div>
                <div className="text-slate-600">Email: {signatory.email}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/* --------------------------- Small UI helpers --------------------------- */

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <div>{label}</div>
      <div>{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Text({ label, value, onChange }) {
  return (
    <label className="grid text-sm">
      <span className="text-slate-600 mb-1">{label}</span>
      <input
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="grid text-sm">
      <span className="text-slate-600 mb-1">{label}</span>
      <textarea
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring w-full"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Number({ label, value, onChange }) {
  const handle = (v) => onChange(safeNum(v));
  return (
    <label className="grid text-sm">
      <span className="text-slate-600 mb-1">{label}</span>
      <input
        type="number"
        className="border rounded-lg px-3 py-2 focus:outline-none focus:ring w-full"
        value={value}
        onChange={(e) => handle(e.target.value)}
        min={0}
      />
    </label>
  );
}

function FormPanel({
  state,
  update,
  changeItem,
  addItem,
  removeItem,
  addTerm,
  removeTerm,
}) {
  const fmtINRLocal = (v) => fmtINR(v);
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-6">
      <Section title="Company">
        <Text
          label="Company Name"
          value={state.company.name}
          onChange={(v) => update("company.name", v)}
        />
        <Text
          label="GST No"
          value={state.company.gst}
          onChange={(v) => update("company.gst", v)}
        />
        <Text
          label="Logo URL"
          value={state.company.logoUrl}
          onChange={(v) => update("company.logoUrl", v)}
        />
        <Text
          label="Address (1)"
          value={state.company.address1}
          onChange={(v) => update("company.address1", v)}
        />
        <Text
          label="Address (2)"
          value={state.company.address2}
          onChange={(v) => update("company.address2", v)}
        />
        <Text
          label="Phone"
          value={state.company.phone}
          onChange={(v) => update("company.phone", v)}
        />
        <Text
          label="Email"
          value={state.company.email}
          onChange={(v) => update("company.email", v)}
        />
        <Text
          label="Website"
          value={state.company.website}
          onChange={(v) => update("company.website", v)}
        />
      </Section>

      <Section title="Quotation">
        <Text
          label="Quotation No."
          value={state.quotation.number}
          onChange={(v) => update("quotation.number", v)}
        />
        <Text
          label="Date"
          value={state.quotation.date}
          onChange={(v) => update("quotation.date", v)}
        />
        <Text
          label="Subject"
          value={state.quotation.subject}
          onChange={(v) => update("quotation.subject", v)}
        />
        <Text
          label="To (Company)"
          value={state.quotation.toCompany}
          onChange={(v) => update("quotation.toCompany", v)}
        />
        <Text
          label="To (Address)"
          value={state.quotation.toAddress}
          onChange={(v) => update("quotation.toAddress", v)}
        />
        <Textarea
          label="Opening Message"
          value={state.quotation.message}
          onChange={(v) => update("quotation.message", v)}
        />
      </Section>

      <Section title="Items">
        <div className="space-y-4">
          {state.items.map((it, idx) => (
            <div
              key={idx}
              className="rounded-lg border p-3 grid grid-cols-1 gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="text-xs px-2 py-0.5 rounded bg-slate-100">
                  #{idx + 1}
                </div>
                <button
                  className="ms-auto text-red-600 text-sm"
                  onClick={() => removeItem(idx)}
                >
                  Remove
                </button>
              </div>
              <Text
                label="Item name"
                value={it.name}
                onChange={(v) => changeItem(idx, "name", v)}
              />
              <Text
                label="Description"
                value={it.description}
                onChange={(v) => changeItem(idx, "description", v)}
              />
              <div className="grid grid-cols-3 gap-2">
                <Number
                  label="Qty"
                  value={it.qty}
                  onChange={(v) => changeItem(idx, "qty", safeNum(v))}
                />
                <Number
                  label="Rate"
                  value={it.rate}
                  onChange={(v) => changeItem(idx, "rate", safeNum(v))}
                />
                <div className="text-sm text-right self-end">
                  Line Total: {fmtINRLocal(safeNum(it.qty) * safeNum(it.rate))}
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full py-2 rounded-lg border border-dashed"
          >
            + Add item
          </button>
        </div>
      </Section>

      <Section title="Charges & Taxes">
        <Number
          label="Discount (₹)"
          value={state.charges.discount}
          onChange={(v) => update("charges.discount", safeNum(v))}
        />
        <Number
          label="Shipping/Other (₹)"
          value={state.charges.shipping}
          onChange={(v) => update("charges.shipping", safeNum(v))}
        />
        <Number
          label="GST %"
          value={state.charges.gstPercent}
          onChange={(v) => update("charges.gstPercent", safeNum(v))}
        />
      </Section>

      <Section title="Terms">
        <div className="space-y-3">
          {state.terms.map((t, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={t}
                onChange={(e) => {
                  const copy = [...state.terms];
                  copy[i] = e.target.value;
                  update("terms", copy);
                }}
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                className="text-red-600 text-sm"
                onClick={() => removeTerm(i)}
              >
                Del
              </button>
            </div>
          ))}
          <button
            onClick={addTerm}
            className="w-full py-2 rounded-lg border border-dashed"
          >
            + Add term
          </button>
        </div>
      </Section>

      <Section title="Signatory">
        <Text
          label="Name"
          value={state.signatory.name}
          onChange={(v) => update("signatory.name", v)}
        />
        <Text
          label="Designation"
          value={state.signatory.designation}
          onChange={(v) => update("signatory.designation", v)}
        />
        <Text
          label="Mobile"
          value={state.signatory.mobile}
          onChange={(v) => update("signatory.mobile", v)}
        />
        <Text
          label="Email"
          value={state.signatory.email}
          onChange={(v) => update("signatory.email", v)}
        />
      </Section>
    </div>
  );
}
