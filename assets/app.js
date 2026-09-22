const app = document.querySelector('#app');
const money = value => value == null ? '—' : (value < 0 ? '(' : '') + '€' + Math.abs(value).toLocaleString('en-IE') + (value < 0 ? ')' : '');
const plain = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name = key => key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
const pill = (label,style=label) => `<span class="pill ${plain(style)}">${plain(label)}</span>`;
const evidenceLink = file => `<a href="/evidence/${encodeURIComponent(file)}" target="_blank" rel="noopener">${plain(file)}</a>`;
const row = (label,value,total=false) => `<tr class="${total?'total':''}"><td>${plain(label)}</td><td class="num">${money(value)}</td></tr>`;
const table = (heading,rows) => `<div class="panel statement"><h3>${plain(heading)}</h3><div class="table-wrap"><table><thead><tr><th>Line</th><th class="num">EUR</th></tr></thead><tbody>${rows.join('')}</tbody></table></div></div>`;
const stat = (label,value,note) => `<div class="stat"><div class="stat-label">${plain(label)}</div><div class="stat-value">${money(value)}</div><div class="stat-note">${plain(note)}</div></div>`;
const sectionHead = (title,caption) => `<div class="section-head"><div><h2>${plain(title)}</h2><p>${plain(caption)}</p></div></div>`;

function statementPanels(d){
  const p=d.statements.profitAndLoss,c=d.statements.cashFlow,b=d.statements.balanceSheet,o=d.schedules.operatingExpenses;
  const pnl=[
    row('Revenue',p.revenue),
    row('Materials consumed and damaged-stock write-down',-p.materialsCostOfSales),
    row('Direct event payroll',-p.directEventPayroll),
    row('Cost of sales',-p.costOfSales,true),
    row('Gross profit',p.grossProfit,true),
    row('Sales and office payroll',-(d.schedules.payroll.salesPayroll+d.schedules.payroll.officePayroll)),
    row('Rent',-o.rent),row('Marketing',-o.marketing),row('Software',-o.software),row('Utilities',-o.utilities),
    row('Repairs',-o.repairs),row('Depreciation',-o.depreciation),row('R-17 credit loss',-o.badDebtExpense),
    row('Employee claim',-o.employeeClaimProvision),row('Stock disposal estimate',-o.stockDisposalProvision),
    row('Total operating expenses',-p.operatingExpenses,true),row('Operating profit',p.operatingProfit,true),
    row('Interest expense',-p.interestExpense),row('Profit for the period',p.profitForPeriod,true)
  ];
  const cash=[
    row('Opening cash',c.openingCash),row('Customer receipts',c.customerReceipts),
    row('Payments to suppliers',c.supplierPayments),row('Payroll paid',c.payrollPaid),
    row('Other operating payments',c.otherOperatingPayments),row('Interest paid',c.interestPaid),
    row('Net operating cash flow',c.netOperatingCashFlow,true),row('PPE purchases',c.ppePurchases),
    row('Net investing cash flow',c.netInvestingCashFlow,true),row('New borrowing',c.newBorrowing),
    row('Principal repaid',c.principalRepaid),row('Owner distributions',c.ownerDistributions),
    row('Net financing cash flow',c.netFinancingCashFlow,true),row('Net cash change',c.netDecrease,true),
    row('Closing cash',c.closingCash,true)
  ];
  const assets=[
    row('Cash',b.cash),row('Trade receivables, gross',b.grossTradeReceivables),
    row('R-17 loss allowance',b.lossAllowance),row('Trade receivables, net',b.netTradeReceivables,true),
    row('Inventory after write-down',b.inventory),row('PPE, net',b.netPPE),
    row('Total assets',b.totalAssets,true)
  ];
  const funding=[
    row('Trade payables',b.tradePayables),row('Payroll payable',b.payrollPayable),
    row('Customer deposits / contract liability',b.deferredRevenue),row('Interest payable',b.interestPayable),
    row('Employee claim provision',b.employeeClaimProvision),row('Stock disposal provision',b.stockDisposalProvision),
    row('Bank loan principal',b.bankLoan),row('Total liabilities',b.totalLiabilities,true),
    row('Closing equity',b.equity,true),row('Total liabilities and equity',b.totalLiabilitiesAndEquity,true)
  ];
  return `<div class="two-col">${table('Profit and loss · Jan–Aug 2026',pnl)}${table('Cash flow · direct method',cash)}${table('Assets · 31 August 2026',assets)}${table('Liabilities and equity · 31 August 2026',funding)}</div>`;
}

function lineTable(headers,body){
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th class="${h.numeric?'num':''}">${plain(h.label)}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function scheduleCard(title,body,open=false){
  return `<details ${open?'open':''}><summary><span>${plain(title)}</span></summary><div class="detail-body">${body}</div></details>`;
}
function schedules(d){
  const s=d.schedules,rr=s.revenueAndReceivables,iv=s.inventoryAndCOGS,py=s.payroll,o=s.operatingExpenses,pp=s.ppe,di=s.debtAndInterest,eq=s.equityAndDistributions,sp=s.supplierPayables;
  const revenueRows=rr.details.map(x=>`<tr><td>${plain(x.item)}</td><td class="num">${money(x.revenue)}</td><td class="num">${money(x.cash)}</td><td class="num">${money(x.receivable)}</td></tr>`).join('');
  const revenue=`<p>All six sales were delivered or completed by 31 August. The two September deposits remain liabilities.</p>${lineTable([{label:'Customer / channel'},{label:'Revenue',numeric:true},{label:'Collected',numeric:true},{label:'Open',numeric:true}],revenueRows)}<p><b>Receivable check:</b> ${money(35000)} opening + ${money(960000)} revenue − ${money(809000)} collections on existing and current sales = ${money(186000)} gross. Less ${money(18000)} R-17 allowance = <b>${money(rr.netReceivables)} net</b>.</p><p class="metadata">Evidence: ${evidenceLink('03 CRM Export Cleaned FINAL.xlsx')}, ${evidenceLink('04 Contracts Returns and Angry Customers.pdf')}, ${evidenceLink('02 Bank Export August.csv')}.</p>`;
  const inventory=`<p><b>Count-based method used in the statements:</b> ${money(iv.openingInventory)} opening + ${money(iv.purchases)} received − ${money(iv.countAtCost)} counted = ${money(iv.normalConsumption)} normal consumption. The ${money(iv.writeDown)} damaged stock is written down to nil, leaving <b>${money(iv.closingInventory)} recoverable inventory</b> and ${money(iv.materialsCostOfSales)} total materials cost.</p>${lineTable([{label:'31 August count'},{label:'At cost',numeric:true}],iv.countBreakdown.map(x=>`<tr><td>${plain(x.item)}</td><td class="num">${money(x.amount)}</td></tr>`).join(''))}<div class="callout"><b>Unresolved ${money(iv.unresolvedVariance)} difference.</b> The warehouse narrative separately states ${money(iv.unresolvedConsumptionNarrative)} consumption. The physical count and purchase roll-forward support ${money(iv.normalConsumption)}. No unsupported balancing entry was added.</div><p class="metadata">Evidence: ${evidenceLink('05 Warehouse Count Marta Notes.pdf')}, ${evidenceLink('06 Purchases Invoices and Goods Received.pdf')}.</p>`;
  const payroll=`<p>${money(py.directEventPayroll)} event staff is direct cost; ${money(py.salesPayroll)} sales and ${money(py.officePayroll)} office payroll are operating expenses.</p><p><b>Payable check:</b> ${money(py.openingPayable)} opening + ${money(py.totalExpense)} period expense − ${money(py.cashPaid)} cash paid = <b>${money(py.closingPayable)} closing payable</b>. The case provides a Jan–Aug combined payment; individual monthly amounts are not evidenced.</p><p>The alleged founder bonus is excluded from employee payroll. The bank shows ${money(70000)} villa and ${money(40000)} owner-card payments, classified as distributions.</p><p class="metadata">Evidence: ${evidenceLink('07 Payroll Bonuses Contractors NEW.xlsx')}, ${evidenceLink('02 Bank Export August.csv')}.</p>`;
  const expenses=`<p>Operating expenses total <b>${money(o.totalOperatingExpenses)}</b>. This includes ${money(o.badDebtExpense)} R-17 loss, ${money(o.employeeClaimProvision)} employee claim, and ${money(o.stockDisposalProvision)} disposal estimate.</p>${lineTable([{label:'Expense'},{label:'EUR',numeric:true}],Object.entries(o).filter(([k,v])=>typeof v==='number'&&k!=='totalOperatingExpenses').map(([k,v])=>`<tr><td>${plain(name(k))}</td><td class="num">${money(v)}</td></tr>`).join(''))}<div class="callout red"><b>Insurance has no verified amount.</b> The 12 supplied files contain no opening balance sheet, insurance payment, or prepayment schedule. The reconstruction books no amount pending that evidence; D034, D060, and D078 are low confidence.</div>`;
  const ppe=`<p>${money(pp.openingCost)} opening cost + ${money(pp.machineAddition)} machine + ${money(pp.photoBoothAddition)} photo booth = <b>${money(pp.closingCost)} closing cost</b>.</p><p>${money(pp.openingAccumulatedDepreciation)} opening accumulated depreciation + ${money(pp.periodDepreciation)} period charge = ${money(pp.closingAccumulatedDepreciation)} accumulated depreciation; net PPE is <b>${money(pp.closingNetPPE)}</b>.</p><p>The ${money(10000)} belt and calibration restored normal operation and is expensed as a repair.</p><p class="metadata">Evidence: ${evidenceLink('08 Assets Repairs Leases Maybe.xlsx')}, ${evidenceLink('06 Purchases Invoices and Goods Received.pdf')}.</p>`;
  const debt=`<p><b>Principal:</b> ${money(di.openingLoan)} opening + ${money(di.newAdvance)} advance − ${money(di.principalRepaid)} repaid = <b>${money(di.closingLoan)} closing debt</b>.</p><p><b>Interest:</b> ${money(di.interestExpense)} incurred − ${money(di.interestPaid)} paid = <b>${money(di.interestPayable)} payable</b>.</p><p class="metadata">Evidence: ${evidenceLink('09 Loans Owner Card and Legal Problems.pdf')}, ${evidenceLink('11 Evidence Received After Takeover.pdf')}.</p>`;
  const equity=`<p><b>Opening balance:</b> ${money(eq.openingEquity)} reconstructed from the opening assets and liabilities in the supplied records.</p><p>${money(eq.openingEquity)} + ${money(eq.profit)} profit − ${money(eq.ownerDistributions)} distributions = <b>${money(eq.closingEquity)} closing equity</b>.</p><p>Distributions comprise ${eq.distributionDetail.map(x=>`${money(x.amount)} ${plain(x.item.toLowerCase())}`).join(' and ')}.</p><p class="metadata">Evidence: ${evidenceLink('02 Bank Export August.csv')}, ${evidenceLink('09 Loans Owner Card and Legal Problems.pdf')}.</p>`;
  const suppliers=`<p>${money(sp.openingPayableInferred)} opening payable + ${money(sp.purchasesReceived)} received invoices − ${money(sp.payments)} supplier payments = <b>${money(sp.closingPayableConfirmed)} closing payable</b>.</p><p>The opening payable is inferred from the confirmed closing balance and the bank trail; it is not presented as a separately supplied opening statement.</p><p class="metadata">Evidence: ${evidenceLink('06 Purchases Invoices and Goods Received.pdf')}, ${evidenceLink('02 Bank Export August.csv')}.</p>`;
  return `<div class="detail-list">${scheduleCard('Revenue and receivables',revenue,true)}${scheduleCard('Inventory and cost of sales',inventory)}${scheduleCard('Payroll and accrued wages',payroll)}${scheduleCard('Operating expenses and provisions',expenses)}${scheduleCard('PPE and depreciation',ppe)}${scheduleCard('Debt and interest',debt)}${scheduleCard('Equity and owner distributions',equity)}${scheduleCard('Supplier payables',suppliers)}</div>`;
}

function decisionCard(x,compact=false){
  const evidence=x.evidence.map(evidenceLink).join(' · ');
  const effect=x.reviewTier==='material_judgment' ? `<div class="review-body"><div><b>Agent 1 first position</b><p>${plain(x.aiProposal)}</p></div><div><b>Agent 2 independent position</b><p>${plain(x.independentChallenge)}</p></div></div><p><b>Reason to verify:</b> ${plain(x.studentReasoning.replace(/^Draft for Dans to verify:\s*/,''))}</p><p><b>Statement effect:</b> profit ${money(x.statementEffect.profit)}, cash ${money(x.statementEffect.cash)}, assets ${money(x.statementEffect.assets)}, liabilities ${money(x.statementEffect.liabilities)}, equity ${money(x.statementEffect.equity)}. <span class="metadata">${plain(x.effectBasis)}</span></p>` : '';
  return `<details id="${plain(x.id)}"><summary><span><b class="decision-id">${plain(x.id)}</b> · ${plain(x.question)}</span><span>${pill(x.reviewTier==='material_judgment'?'Material':'Operational',x.reviewTier==='material_judgment'?'medium':'high')} ${pill(x.confidence,x.confidence)}</span></summary><div class="detail-body"><p><b>Proposed answer:</b> ${plain(x.answer)}</p>${effect}<p class="metadata"><b>Evidence:</b> ${evidence}</p>${x.agentDisagreement?'<p class="metadata">Agent difference: presentation of the stock write-down; closing profit and inventory agree.</p>':''}<p class="metadata">Student review: pending.</p></div></details>`;
}
function evidenceCards(d){
  return `<div class="evidence-grid">${d.evidenceRegister.map(e=>`<article class="panel evidence-card"><div>${pill(e.id,'high')} ${pill(e.strength,e.strength)}</div><h3>${plain(e.name)}</h3><p>${plain(e.role)}</p><a href="${e.href}" target="_blank" rel="noopener">Open source file</a></article>`).join('')}</div>`;
}
function uncertaintyCards(d){
  return `<div class="two-col">${d.uncertainties.map(u=>`<article class="panel"><p>${pill(u.status.replaceAll('_',' '),u.status)} ${pill(u.confidence+' confidence',u.confidence)}</p><h3>${plain(u.issue)}${u.amount!=null?' · '+money(u.amount):''}</h3><p>${plain(u.treatment)}</p></article>`).join('')}</div>`;
}
function checks(d){
  return `<div class="check-list">${d.reconciliations.map(x=>`<div class="check">${pill(x.status)} <b>${plain(x.name)}</b><small>${plain(x.calculation)}</small></div>`).join('')}</div>`;
}
function fullPage(d){
  const p=d.statements.profitAndLoss,c=d.statements.cashFlow,b=d.statements.balanceSheet;
  app.innerHTML=`
    <section id="overview" class="intro"><div class="intro-copy"><p class="eyebrow">Takeover finance file · 01</p><h1>Reconstructed from the case evidence</h1><p>Profit is ${money(p.profitForPeriod)} for the eight months to 31 August 2026. The ${money(60000)} closing cash agrees with the bank. The physical inventory count and the recorded materials consumption differ by ${money(9000)}, which remains under review.</p><p class="note" style="color:#cfe3e8">The 100 prepared decisions require your own review before final certification.</p></div><div class="intro-side"><p class="eyebrow">Reading rule</p><h3>Start with the trace</h3><p>Every statement number has a supporting schedule. Each decision names its evidence, and the original files are available below.</p><a href="#schedules">Follow the schedules →</a></div></section>
    <div class="stats">${stat('Revenue',p.revenue,'Delivered work only')}${stat('Profit',p.profitForPeriod,'Management claimed €312,000')}${stat('Closing cash',c.closingCash,'Bank-confirmed')}${stat('Closing equity',b.equity,'Assets less liabilities')}</div>
    <section id="statements" class="section">${sectionHead('Three financial statements','Amounts in EUR; expenses and cash outflows are shown in parentheses.')}${statementPanels(d)}</section>
    <section id="schedules" class="section">${sectionHead('Supporting schedules','Open each schedule to see the calculation and source documents.')}${schedules(d)}</section>
    <section id="reconciliations" class="section">${sectionHead('Reconciliation checks','The arithmetic closes; the separate inventory evidence conflict is disclosed below.')}${checks(d)}</section>
    <section id="decisions" class="section">${sectionHead('Decision register','All 75 operational decisions and 25 material judgments are searchable here.')}<div class="searchbar"><label for="decision-search">Find a decision</label><input id="decision-search" type="search" placeholder="Search ID, question, answer or evidence"><label for="tier-filter">Show</label><select id="tier-filter"><option value="all">All 100</option><option value="material_judgment">25 material judgments</option><option value="operational">75 operational</option><option value="low">Low confidence</option></select><span id="decision-count" class="count"></span></div><div id="decision-list" class="decision-grid"></div></section>
    <section id="evidence" class="section">${sectionHead('Evidence register','Strength describes source reliability; every link opens the original case file.')}${evidenceCards(d)}</section>
    <section id="uncertainties" class="section">${sectionHead('What remains uncertain','These items affect confidence in the reconstruction or require follow-up.')}${uncertaintyCards(d)}</section>
    <section id="board" class="section">${sectionHead('Board recommendation','Actions linked to the financial and control findings.')}<div class="panel"><p>${plain(d.boardRecommendation.recommendation)}</p><ol>${d.boardRecommendation.priorityActions.map(x=>`<li>${plain(x)}</li>`).join('')}</ol><p class="note">Closing cash of ${money(c.closingCash)} is below confirmed supplier payables of ${money(b.tradePayables)}. Equity is positive, but loan maturities and creditor payment dates are not supplied.</p></div></section>`;
  bindDecisions(d);
}
function bindDecisions(d){
  const input=document.querySelector('#decision-search'),select=document.querySelector('#tier-filter'),list=document.querySelector('#decision-list'),count=document.querySelector('#decision-count');
  const draw=()=>{const q=input.value.trim().toLowerCase(),f=select.value;const found=d.decisions.filter(x=>(f==='all'||(f==='low'?x.confidence==='low':x.reviewTier===f))&&[x.id,x.question,x.answer,...x.evidence].join(' ').toLowerCase().includes(q));list.innerHTML=found.map(x=>decisionCard(x)).join('')||'<p class="empty">No decisions match this search.</p>';count.textContent=`${found.length} of 100 decisions shown`;};
  input.addEventListener('input',draw);select.addEventListener('change',draw);draw();
}
function reviewPage(d){
  const material=d.decisions.filter(x=>x.reviewTier==='material_judgment'),low=d.decisions.filter(x=>x.confidence==='low'),diff=material.filter(x=>x.agentDisagreement),changed=material.filter(x=>x.changedFromAI);
  app.innerHTML=`<section class="section"><p class="eyebrow" style="color:var(--teal)">DPI HT 01 · 31 August 2026</p><h1>Assessor review</h1><p>Find the 25 material judgments, both independent AI positions, the proposed final treatment, evidence and statement effect. The student's personal certification remains to be completed.</p><div class="review-summary"><div class="stat"><div class="stat-label">Decision IDs</div><div class="stat-value">100</div><div class="stat-note">75 operational · 25 material</div></div><div class="stat"><div class="stat-label">Agent differences</div><div class="stat-value">${diff.length}</div><div class="stat-note">Presentation only</div></div><div class="stat"><div class="stat-label">Changed from Agent 1</div><div class="stat-value">${changed.length}</div><div class="stat-note">Current proposals</div></div><div class="stat"><div class="stat-label">Low confidence</div><div class="stat-value">${low.length}</div><div class="stat-note">Insurance evidence missing</div></div></div></section><section class="section"><div class="callout"><b>Effect amounts are not additive.</b> Several IDs describe the same accounting entry. Read each decision's stated effect basis before comparing it with the three statements.</div><div class="searchbar"><label for="review-filter">Focus</label><select id="review-filter"><option value="material">25 material judgments</option><option value="differences">Agent differences</option><option value="changed">Changed from Agent 1</option><option value="low">Low-confidence decisions</option><option value="all">All 100 decisions</option></select><input id="review-search" type="search" placeholder="Search decisions"><span id="review-count" class="count"></span></div><div id="review-list" class="detail-list"></div></section><section class="section">${sectionHead('Open items','The reported statements use the count-based inventory result and show missing insurance evidence plainly.')}${uncertaintyCards(d)}</section><section class="section">${sectionHead('Statement checks','The prepared submission and the visible statements use the same data.')}${checks(d)}</section>`;
  const select=document.querySelector('#review-filter'),input=document.querySelector('#review-search'),list=document.querySelector('#review-list'),count=document.querySelector('#review-count');
  const draw=()=>{let ids=select.value==='material'?material:select.value==='differences'?diff:select.value==='changed'?changed:select.value==='low'?low:d.decisions;let q=input.value.trim().toLowerCase();ids=ids.filter(x=>[x.id,x.question,x.answer,...x.evidence].join(' ').toLowerCase().includes(q));list.innerHTML=ids.map(x=>decisionCard(x,true)).join('')||'<p class="empty">No decisions in this view.</p>';count.textContent=`${ids.length} shown`;};
  select.addEventListener('change',draw);input.addEventListener('input',draw);draw();
}

fetch('/submission.json').then(r=>{if(!r.ok)throw new Error('Submission data unavailable');return r.json()}).then(d=>app.dataset.page==='review'?reviewPage(d):fullPage(d)).catch(err=>{app.innerHTML=`<div class="callout red"><b>Could not load the case data.</b> ${plain(err.message)}. Open <a href="/submission.json">submission.json</a> to check the published file.</div>`;});
