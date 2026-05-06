const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageBreak, LevelFormat
} = require('docx');
const fs = require('fs');

const C = {
  navy:"1B4F72", blue:"2E86C1", lb:"D6EAF8",
  green:"1E8449", gl:"D5F5E3",
  orange:"CA6F1E", ol:"FDEBD0",
  red:"922B21", rl:"FADBD8",
  purple:"6C3483", pl:"E8DAEF",
  gray:"566573", grayL:"F2F3F4",
  teal:"0E6655", tealL:"D1F2EB",
  white:"FFFFFF", black:"1A1A1A"
};

const bdr = (c="AAAAAA")=>({style:BorderStyle.SINGLE,size:1,color:c});
const ab = (c="CCCCCC")=>({top:bdr(c),bottom:bdr(c),left:bdr(c),right:bdr(c)});

function tc(text,{bg=C.white,bold=false,color=C.black,w=2000,sz=18}={}){
  return new TableCell({
    borders:ab(), width:{size:w,type:WidthType.DXA},
    shading:{fill:bg,type:ShadingType.CLEAR},
    margins:{top:60,bottom:60,left:100,right:100},
    verticalAlign:VerticalAlign.CENTER,
    children:[new Paragraph({children:[new TextRun({text:String(text),bold,color,font:"Arial",size:sz})]})]
  });
}
function hc(t,w,bg=C.navy){return tc(t,{bg,bold:true,color:C.white,w,sz:18});}
function alt(i){return i%2===0?C.white:C.grayL;}
function tbl(headers,rows,widths,hbg=C.navy){
  return new Table({
    width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA},
    columnWidths:widths,
    rows:[
      new TableRow({tableHeader:true,children:headers.map((h,i)=>hc(h,widths[i],hbg))}),
      ...rows.map((row,ri)=>new TableRow({children:row.map((v,ci)=>tc(v,{bg:alt(ri),w:widths[ci]}))}))
    ]
  });
}

const h1=(t)=>new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:360,after:160},
  border:{bottom:{style:BorderStyle.SINGLE,size:8,color:C.navy,space:4}},
  children:[new TextRun({text:t,font:"Arial",size:34,bold:true,color:C.navy})]});
const h2=(t)=>new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:260,after:120},
  children:[new TextRun({text:t,font:"Arial",size:26,bold:true,color:C.blue})]});
const h3=(t)=>new Paragraph({heading:HeadingLevel.HEADING_3,spacing:{before:200,after:80},
  children:[new TextRun({text:t,font:"Arial",size:22,bold:true,color:C.teal})]});
const p=(t,{bold=false,color=C.black,sz=20,it=false}={})=>new Paragraph({spacing:{after:100},
  children:[new TextRun({text:t,font:"Arial",size:sz,bold,color,italics:it})]});
const bl=(t,lvl=0)=>new Paragraph({numbering:{reference:"bullets",level:lvl},spacing:{after:60},
  children:[new TextRun({text:t,font:"Arial",size:19,color:C.black})]});
const pb=()=>new Paragraph({children:[new PageBreak()]});
const sp=()=>new Paragraph({spacing:{after:80},children:[new TextRun("")]});
function banner(t,color,bg){
  return new Paragraph({spacing:{before:120,after:80},
    shading:{fill:bg,type:ShadingType.CLEAR},indent:{left:280},
    children:[new TextRun({text:t,font:"Arial",size:20,bold:true,color})]});
}
function warn(t){
  return new Paragraph({spacing:{before:100,after:100},
    shading:{fill:"FFF3CD",type:ShadingType.CLEAR},indent:{left:280},
    children:[new TextRun({text:"⚠  "+t,font:"Arial",size:19,bold:false,color:"856404"})]});
}
function note(t){
  return new Paragraph({spacing:{before:80,after:80},
    shading:{fill:C.lb,type:ShadingType.CLEAR},indent:{left:280},
    children:[new TextRun({text:"📌  "+t,font:"Arial",size:19,color:C.navy})]});
}
function rule(t){
  return new Paragraph({spacing:{before:80,after:80},
    shading:{fill:C.rl,type:ShadingType.CLEAR},indent:{left:280},
    children:[new TextRun({text:"🔒  "+t,font:"Arial",size:19,color:C.red})]});
}

// ─── COVER ────────────────────────────────────────────────────────────────
function cover(){
  return [
    sp(),sp(),sp(),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},
      children:[new TextRun({text:"RestroOps AI",font:"Arial",size:80,bold:true,color:C.navy})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},
      children:[new TextRun({text:"Full Build Guide — Developer Implementation Document",font:"Arial",size:30,color:C.blue,italics:true})]}),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},
      children:[new TextRun({text:"NO MOCK DATA · NO DEMO FRONTEND · REAL-TIME ONLY",font:"Arial",size:22,bold:true,color:C.red})]}),
    sp(),
    tbl(["Property","Value"],[
      ["Document Type","Developer Build Guide — Every screen, every button, every API"],
      ["Audience","Frontend devs, backend devs, fullstack engineers"],
      ["Rule #1","ZERO mock data. Every value must come from a real API call."],
      ["Rule #2","Every button has a real API endpoint. No fake handlers."],
      ["Rule #3","Role access enforced at DB (RLS) + API middleware + UI level (3 layers)."],
      ["Rule #4","Any feature not yet built = hidden via feature flag. Not mocked."],
    ],[3000,6360],C.navy),
    sp(),pb()
  ];
}

// ─── SECTION 1: ROLE SYSTEM ───────────────────────────────────────────────
function sec1(){
  return [
    h1("1. Role System — Complete Authorization Map"),
    warn("This is the single most important section. Every UI decision, every button, every API guard is based on this role map. Read this before building anything."),
    sp(),

    h2("1.1 The 6 Roles"),
    tbl(["Role","Who Is This","Platform","Created By","Can Create Role"],[
      ["super_admin","RestroOps CTO / founding team","Admin web only","Hardcoded in DB seed","No one — manually assigned"],
      ["ops_manager","RestroOps client-facing staff","Admin web only","super_admin only","Cannot create any role"],
      ["ai_agent","Automated AI worker per restaurant","Backend only","System on account creation","N/A — not a human"],
      ["owner","Restaurant paying client (owner)","Mobile + Web","super_admin OR ops_manager","Can create: manager, advisor"],
      ["manager","On-site restaurant manager","Mobile (limited web)","owner only","Cannot create any role"],
      ["advisor","External CPA / accountant","Web read-only","owner only","Cannot create any role"],
    ],[2000,2800,1600,2400,2560],C.navy),
    sp(),

    h2("1.2 Role Creation Rules (Authorization Chain)"),
    rule("super_admin is the only role that can create an ops_manager account. There is NO UI for this — it is done via a protected Admin CLI command or a seeded SQL migration."),
    rule("ops_manager CANNOT create any user accounts. They can only manage existing restaurant accounts assigned to them."),
    rule("owner can invite a manager or advisor via the Settings → Team page. The invite sends a magic link email. Owner CANNOT create another owner."),
    rule("manager and advisor have NO ability to create, invite, or modify any user accounts."),
    sp(),

    tbl(["Who Can Grant This Role","super_admin","ops_manager","owner","manager","advisor"],[
      ["super_admin","—","✅ Yes","✅ Yes","✅ Yes","✅ Yes"],
      ["ops_manager","❌ Never","—","❌ Never","❌ Never","❌ Never"],
      ["owner","❌ Never","❌ Never","—","❌ Never","❌ Never"],
      ["manager","❌ Never","❌ Never","✅ Owner invites","—","❌ Never"],
      ["advisor","❌ Never","❌ Never","✅ Owner invites","❌ Never","—"],
    ],[2400,1400,1400,1400,1400,1400],C.blue),
    sp(),

    h2("1.3 Role Permission Table — Every Feature"),
    tbl(["Feature / Action","super_admin","ops_manager","owner","manager","advisor"],[
      ["View own dashboard","✅","✅ all accounts","✅ own only","✅ own only","✅ read-only"],
      ["Approve payroll","✅","✅ override only","✅","❌","❌"],
      ["Edit payroll line items","✅","✅","❌ (must flag)","✅ own shifts only","❌"],
      ["View payroll","✅","✅","✅","❌","✅ read-only"],
      ["View P&L / reports","✅","✅","✅","❌","✅"],
      ["Export reports","✅","✅","✅","❌","✅"],
      ["Recategorize transactions","✅","✅","✅","❌","❌"],
      ["Add manual transaction","✅","✅","✅","❌","❌"],
      ["Approve invoices","✅","✅","✅","❌","❌"],
      ["Dispute invoices","✅","✅","✅","❌","❌"],
      ["Upload invoices","✅","✅","✅","✅","❌"],
      ["Add / edit vendors","✅","✅","✅","❌","❌"],
      ["Approve compliance drafts","✅","✅","✅ (review)","❌","❌"],
      ["Submit compliance filings","✅","✅","❌","❌","❌"],
      ["Upload permits / docs","✅","✅","✅","❌","❌"],
      ["Add employee","✅","✅","✅","❌","❌"],
      ["Terminate employee","✅","❌","✅","❌","❌"],
      ["Approve time-off","✅","❌","✅","✅","❌"],
      ["View employee records","✅","✅","✅","Name+contact only","❌"],
      ["Log inventory count","✅","✅","✅","✅","❌"],
      ["View inventory analytics","✅","✅","✅","✅","❌"],
      ["Chat with AI agent","✅","✅ (client view)","✅","✅","❌"],
      ["Exception queue (view)","✅","✅","❌","❌","❌"],
      ["Exception queue (resolve)","✅","✅","❌","❌","❌"],
      ["Feature flags","✅","❌","❌","❌","❌"],
      ["Billing management","✅","View only","View + upgrade","❌","❌"],
      ["Invite team members","✅","❌","✅ (mgr+advisor)","❌","❌"],
      ["Impersonate user","✅","✅ (support only)","❌","❌","❌"],
      ["Audit log access","✅ full","✅ assigned accts","✅ own actions","✅ own actions","❌"],
      ["API config / integrations","✅","❌","✅ (connect POS/bank)","❌","❌"],
    ],[3200,1200,1400,1100,1200,1260],C.blue),
    pb()
  ];
}

// ─── SECTION 2: AUTH SCREENS ──────────────────────────────────────────────
function sec2(){
  return [
    h1("2. Authentication — Every Screen & Button"),
    warn("NO session persistence in localStorage. Access token in memory only. Refresh token in httpOnly cookie only."),
    sp(),

    h2("2.1 Login Screen"),
    p("Route: /login  |  Accessible to: unauthenticated users only. Redirect to /dashboard if already authenticated."),
    sp(),
    tbl(["Element","Type","Real-Time Behavior","API Called"],[
      ["Email input","text input","Validate format on blur. Show red border + 'Invalid email' if bad format.","—"],
      ["Password input","password input","Show/hide toggle (eye icon). Min 8 chars enforced on submit.","—"],
      ["Sign In button","primary button","Disabled until both fields non-empty. Shows spinner on click. Text changes to 'Signing in…'","POST /v1/auth/login"],
      ["Forgot Password link","text link","Navigate to /forgot-password page","—"],
      ["Error banner","alert (red)","Show below button on API error: 'Invalid email or password' (never say which is wrong)","—"],
      ["Lockout banner","alert (orange)","Show if API returns 429: 'Too many attempts. Try again in X minutes.' Show countdown timer.","—"],
    ],[2200,1400,3200,2560],C.navy),
    note("After successful login: if user.role is super_admin or ops_manager → redirect to /admin/dashboard. All others → /dashboard. Role comes from JWT, never from localStorage."),
    sp(),

    h2("2.2 MFA Verification Screen"),
    p("Route: /mfa  |  Only reachable if POST /auth/login returned mfa_required:true. Direct URL access → redirect to /login."),
    sp(),
    tbl(["Element","Type","Behavior","API Called"],[
      ["OTP input (6 digits)","number input, auto-advance","Auto-submit when 6th digit entered. Accept paste of full code.","POST /v1/auth/mfa/verify"],
      ["Verify button","primary button","Disabled until 6 digits entered. Spinner on click.","POST /v1/auth/mfa/verify"],
      ["Use SMS instead link","text link","Triggers SMS OTP to phone. Shows 'Code sent' toast. Same verify endpoint.","POST /v1/auth/mfa/sms-send"],
      ["Resend code link","text link","Show after 30s countdown. Disabled until countdown done.","POST /v1/auth/mfa/sms-send"],
      ["Back to Login link","text link","Clear temp_token from memory, navigate to /login","—"],
      ["Error text","inline red text","'Incorrect code. X attempts remaining.' Below input.","—"],
    ],[2200,1400,3200,2560],C.navy),
    sp(),

    h2("2.3 Forgot Password Screen"),
    tbl(["Element","Type","Behavior","API Called"],[
      ["Email input","text input","Same validation as login screen","—"],
      ["Send Reset Link button","primary button","Spinner on click. Always show success message regardless of whether email exists (security).","POST /v1/auth/forgot-password"],
      ["Success message","green banner","'If that email is registered, a reset link has been sent.' Never confirm email exists.","—"],
    ],[2200,1400,3200,2560],C.navy),
    sp(),

    h2("2.4 Biometric Login (Mobile Only)"),
    p("On mobile app: after first login, offer 'Enable Face ID / Fingerprint' prompt. Biometric result decrypts locally stored refresh_token. Calls POST /auth/refresh to get new access_token. No credentials sent."),
    rule("Biometric login only works if user has previously logged in with password on that device. Cannot be used on a new device."),
    pb()
  ];
}

// ─── SECTION 3: OWNER WEB APP — ALL SCREENS ───────────────────────────────
function sec3(){
  return [
    h1("3. Restaurant Owner — Web App (app.restroops.ai)"),
    warn("Every number, chart, and label must come from a real API call. No hardcoded values. No mock data. Show skeleton loaders while fetching. Show error state if fetch fails."),
    sp(),

    h2("3.1 Left Sidebar Navigation"),
    tbl(["Menu Item","Sub-items","Visible To","Real-Time Badge"],[
      ["🏠 Dashboard","—","owner, manager","Unread alerts count from GET /notifications/count"],
      ["💰 Payroll","Current, History","owner","'PENDING' badge from GET /payroll/status → status=pending_approval"],
      ["📒 Accounting","P&L, Transactions, Reconciliation, Cash Flow","owner, advisor","Red dot if reconciliation_status=discrepancy"],
      ["🧾 Vendors & Invoices","Vendors, Invoice Inbox, Payment Schedule","owner","Count of invoices with status=needs_review"],
      ["📜 Compliance","Calendar, Vault, Tax Summary","owner, advisor","Count of overdue items from GET /compliance/calendar"],
      ["📦 Inventory","Dashboard, Log Count, Variance Report","owner, manager","—"],
      ["👥 HR & Staff","Directory, Onboarding, Time-Off","owner","Count of pending time-off requests"],
      ["🤖 AI Chat","—","owner, manager","—"],
      ["📊 Reports","—","owner, advisor","—"],
      ["⚙️ Settings","Profile, Team, Billing, Integrations","owner","—"],
    ],[2000,3000,1800,3560],C.teal),
    note("All badge counts fetched on page load via GET /v1/nav/badges?restaurant_id=X. Refresh every 60s via polling. No fake numbers."),
    sp(),

    h2("3.2 Dashboard Screen"),
    banner("GET /v1/dashboard/summary?restaurant_id=X&period=week — fetches ALL widget data in one call",C.navy,C.lb),
    sp(),
    tbl(["Widget / Element","What It Shows","Data Source","Click Action"],[
      ["Weekly P&L Card","Revenue / Expenses / Net Profit. '▲ 4.2% vs last week' or '▼ 1.1%'. Green if profit, red if loss.","dashboard.pl object from summary API","Opens /accounting/pl with current week filter pre-applied"],
      ["Payroll Status Banner","Only visible if payroll_run.status = pending_approval. Shows: 'Payroll pending — $X for N employees. Due: [date]'","dashboard.payroll object","Opens /payroll/current"],
      ["Cash Flow Sparkline","30-day projection line chart. No axis labels on dashboard — full chart on click.","dashboard.cash_flow_30d array","Opens /accounting/cash-flow"],
      ["AI Insights Feed","Cards: 'Food cost up 4% this week', 'Invoice from Sysco overdue'. Each card shows AI reasoning.","GET /v1/ai/insights (Redis cached 1hr)","'Tell Me More' → opens AI chat with pre-filled question. 'Dismiss' → DELETE /v1/ai/insights/:id"],
      ["Quick Actions Bar","3 buttons: Log Sale · Submit Expense · Message Agent","Static buttons — no API until clicked","Each opens a modal (not a new page) with a form"],
      ["Vendor Payments Due","List of next 3 upcoming payments: vendor name, amount, due date, days remaining.","dashboard.vendor_dues array","'View Invoice' → opens invoice detail. 'Pay Now' → POST /v1/vendors/payments/:id/pay-now with confirm modal"],
      ["Staff On Shift Counter","'7 staff currently clocked in' with names list on hover/tap","GET /v1/staff/on-shift — live, not cached","Opens /hr/directory filtered to on-shift"],
      ["Month Selector","Dropdown at top: current month pre-selected","Pre-selected from current date","On change: re-call GET /v1/dashboard/summary with new month param. Update all widgets."],
      ["Notification Bell","Red badge with unread count","GET /v1/notifications/count","Opens notification panel slide-over"],
    ],[2400,3000,2400,1560],C.teal),
    sp(),

    h2("3.3 Log Sale Modal (Quick Action)"),
    p("Opens as a modal overlay on the dashboard. Does NOT navigate away."),
    tbl(["Field / Button","Type","Validation","API"],[
      ["Sale Amount ($)","number input","Required. Min $0.01. Max $99,999.","—"],
      ["Date","date picker","Required. Default: today. Cannot be future date.","—"],
      ["Payment Method","dropdown","Options: Cash, Card, Online. Required.","Loaded from static list — no API needed"],
      ["Note (optional)","text input","Max 200 chars","—"],
      ["Submit Sale button","primary button","Disabled if amount empty. Spinner on submit.","POST /v1/accounting/transactions/manual"],
      ["Cancel button","secondary button","Close modal. No API call.","—"],
      ["Success state","green toast","'Sale of $X logged successfully.' Auto-dismiss 3s. Dashboard P&L card refreshes.","—"],
    ],[2400,1400,2400,3160],C.teal),
    sp(),

    h2("3.4 Payroll Screen"),
    banner("GET /v1/payroll/runs/current?restaurant_id=X — no caching, always fresh",C.green,C.gl),
    sp(),
    tbl(["Element","What It Shows","Behavior / API"],[
      ["Pay Period Selector","Dropdown: 'Jun 1 – Jun 14 (Current)'. Older periods listed below.","On change: GET /v1/payroll/runs/:id for selected period"],
      ["Payroll Summary Banner","Total Gross / Total Net / Total Taxes / Employee Count — 4 stat boxes at top","Populated from payroll_run totals. No calculation on frontend."],
      ["Employee Table","Columns: Name · Role · Hours (Regular) · Hours (OT) · Gross Pay · Deductions · Net Pay · Status","GET /v1/payroll/runs/current returns line_items array. Render as table rows."],
      ["⚠ Anomaly Flag Badge","Yellow badge on row if line_item.anomaly_flag=true","Tap/click badge → GET /v1/payroll/line-items/:id/anomaly-detail → shows modal with AI explanation"],
      ["Flag for Review button","Icon button per row (flag icon)","POST /v1/payroll/line-items/:id/flag — marks that row. Row gets orange outline. Excluded from 'Approve All'."],
      ["Approve All button","Large green button — bottom of table","Show confirm modal: 'Approve $X.XX for N employees?' Only enabled if no un-reviewed anomalies. POST /v1/payroll/runs/:id/approve"],
      ["Approve Selected button","Secondary green button","Approves only non-flagged rows. Flagged rows sent to exception queue. POST /v1/payroll/runs/:id/approve-partial"],
      ["Reject & Comment button","Red button","Opens textarea modal for reason. POST /v1/payroll/runs/:id/reject { comment }"],
      ["Download Summary button","Outlined button","GET /v1/payroll/runs/:id/pdf → returns signed S3 URL → browser opens PDF in new tab"],
      ["History Tab","Table: Period · Total · Status · Approved By · Date","GET /v1/payroll/runs?restaurant_id=X&page=1&limit=20"],
    ],[2800,3200,3360],C.green),
    rule("Owner can NEVER directly edit a payroll line item. They can only Approve, Approve Selected, Reject, or Flag. If they tap a number in the table → show tooltip: 'To correct this, use Flag for Review.'"),
    sp(),

    h2("3.5 Accounting → Transactions Screen"),
    tbl(["Element","Behavior","API"],[
      ["Search bar","Live search as user types (debounce 400ms). Searches description + vendor name.","GET /v1/accounting/transactions?q=&restaurant_id=X"],
      ["Filter bar","Filters: Category (dropdown) · Date Range (date picker) · Source (dropdown) · Reconciled (toggle)","All filters append as query params to same GET endpoint"],
      ["Transaction table","Columns: Date · Description · Amount · Category · Source · Reconciled status (icon)","Paginated. GET /v1/accounting/transactions?page=N&limit=50"],
      ["Category cell (click)","Click category → opens inline dropdown of all GL categories","On selection: PUT /v1/accounting/transactions/:id/category { category }. Row updates optimistically, reverts if API fails."],
      ["Reconciliation icon","✅ Green = reconciled · 🟡 Yellow = pending · 🔴 Red = discrepancy","Fetch with transaction data"],
      ["Red row (discrepancy)","Row has red left border + 'Resolve' button in last column","'Resolve' button → GET /v1/accounting/reconciliation/:id/detail → opens side panel showing bank amount vs book amount + 3 resolution options"],
      ["Export CSV button","Top right of table","GET /v1/accounting/transactions/export?format=csv&[same filters] → download file"],
      ["Export to QuickBooks button","Top right, next to CSV","POST /v1/integrations/quickbooks/export → shows progress modal → 'X transactions exported'"],
      ["Add Manual Transaction button","Top right, primary","Opens modal — same as Log Sale but with full category selector"],
      ["Load More / Pagination","Bottom of table","Append next page to existing rows. GET with page param incremented."],
    ],[2600,3400,3360],C.purple),
    sp(),

    h2("3.6 Vendor & Invoice Screen"),
    tbl(["Element","Behavior","API"],[
      ["Vendor List tab","Table: Name · Category · Avg Monthly Spend · Last Payment · Terms · Actions","GET /v1/vendors?restaurant_id=X"],
      ["Add Vendor button","Opens multi-step modal: (1) Name+Category+Contact, (2) Payment Terms+Bank Details, (3) Confirm","POST /v1/vendors { name, category, payment_terms, bank_account_encrypted }"],
      ["Edit Vendor button","Per row. Opens same modal pre-filled.","PUT /v1/vendors/:id"],
      ["Invoice Inbox tab","Table: Vendor · Invoice # · Amount · Due Date · Status (color badge) · Actions","GET /v1/invoices?restaurant_id=X&status=all"],
      ["Status filter","Dropdown: All · New · Processing · Matched · Needs Review · Approved · Disputed · Paid","Appends status= param to GET /v1/invoices"],
      ["Upload Invoice button","Opens file picker (JPG/PNG/PDF, max 20MB). Shows upload progress bar.","POST /v1/files/presign → client uploads to S3 → POST /v1/invoices/confirm"],
      ["View Invoice button","Per row. Opens side panel showing: extracted data, original document (from signed S3 URL), AI match summary.","GET /v1/invoices/:id/detail"],
      ["Approve button","Per row. Only on status=needs_review or status=matched.","Confirm modal: 'Approve $X from Vendor Y?' → POST /v1/invoices/:id/approve"],
      ["Dispute button","Per row. On any non-paid status.","Opens modal with: reason dropdown + note textarea + 'Send email to vendor' toggle. POST /v1/invoices/:id/dispute"],
      ["Auto-Match toggle","Top of Invoice Inbox tab. Default: ON.","PUT /v1/restaurants/:id/settings { auto_match_invoices: true/false }. Persisted in DB. Show current value from settings."],
      ["Payment Schedule tab","Calendar view. Color: Green=paid, Yellow=due 7+ days, Red=due <7 days.","GET /v1/vendors/payments/schedule?restaurant_id=X&month=YYYY-MM"],
      ["Pay Now button","On each payment in schedule if due date past or today.","Confirm modal with bank account shown → POST /v1/vendors/payments/:id/pay-now"],
      ["Spend Analytics tab","Bar chart: monthly spend per vendor. Trend line.","GET /v1/vendors/:id/analytics?period=6m — render with Recharts, no static data"],
    ],[2600,3400,3360],C.orange),
    sp(),

    h2("3.7 Compliance Screen"),
    tbl(["Element","Behavior","API"],[
      ["Calendar view","Monthly calendar. Color-coded events. Click event to open detail.","GET /v1/compliance/calendar?restaurant_id=X&month=YYYY-MM"],
      ["List view toggle","Switch between calendar and table list view","Same API, different render"],
      ["Status badge per item","✅ Filed · ⏳ Draft Ready · 🟡 Due Soon · 🔴 Overdue","From compliance_item.status field"],
      ["View Draft button","Per item where status=draft_ready","GET /v1/compliance/:id/draft → opens PDF viewer modal with AI-prepared document"],
      ["Approve Draft button","Inside draft viewer modal","POST /v1/compliance/:id/approve — assigns to Ops Manager for submission. Show: 'Draft approved. Our team will submit this by [due date].'"],
      ["Document Vault tab","File browser by year and type. Folders expand to show files.","GET /v1/compliance/vault?restaurant_id=X"],
      ["Download button","Per file in vault","GET /v1/compliance/documents/:id/download → returns signed S3 URL → open in new tab"],
      ["Upload Permit button","File picker. PDF or image.","POST /v1/files/presign → S3 upload → POST /v1/compliance/documents/upload { s3_key, type, expiry_date }"],
      ["Expiry Date field","Required on permit upload. Shows reminder settings after upload.","Stored on compliance_item record"],
      ["Tax Summary tab","Annual cards: Sales Tax Collected · Payroll Taxes · Estimated Income Tax. Year selector.","GET /v1/compliance/tax-summary?restaurant_id=X&year=2024"],
    ],[2600,3400,3360],C.red),
    sp(),

    h2("3.8 HR & Staff Screen"),
    tbl(["Element","Behavior","API"],[
      ["Employee Directory","Grid (card view default) or table view toggle. Each card: photo initial, name, role, status badge, hire date.","GET /v1/hr/employees?restaurant_id=X"],
      ["Add Employee button","Multi-step form: (1) Personal info, (2) Role+pay rate, (3) Tax info (W-4 fields by state). Submit triggers onboarding checklist creation.","POST /v1/hr/employees"],
      ["Employee card click","Opens employee detail side panel. Shows full profile + document list + history tabs.","GET /v1/hr/employees/:id"],
      ["Upload Document (per employee)","In employee detail panel. File picker.","POST /v1/hr/employees/:id/documents"],
      ["Terminate button","Red button inside employee detail. Owner only — hidden for other roles.","Confirm modal: 'This will calculate final paycheck and trigger offboarding.' → POST /v1/hr/employees/:id/terminate"],
      ["Onboarding tab","Per-employee checklist. Each item has status icon.","GET /v1/hr/employees/:id/onboarding — shows documents sent/signed/pending"],
      ["Time-Off Calendar","Monthly view. Per-staff color coding. Approved=green, Pending=yellow.","GET /v1/hr/time-off?restaurant_id=X&month=YYYY-MM"],
      ["Approve Time-Off button","Per pending request. Checks AI warning if short-staffed.","POST /v1/hr/time-off/:id/approve — if understaffed, shows warning banner before confirm"],
      ["Deny Time-Off button","Per pending request. Opens reason field.","POST /v1/hr/time-off/:id/deny { reason }"],
      ["Staff Cost Analytics tab","Line chart: labor cost % of revenue over time. Industry benchmark line.","GET /v1/hr/analytics?restaurant_id=X&period=6m"],
    ],[2600,3400,3360],C.green),
    sp(),

    h2("3.9 AI Chat Screen"),
    tbl(["Element","Behavior","API"],[
      ["Chat thread","Messages displayed chronologically. Owner=right (blue bubble), AI=left (gray bubble). Timestamps on hover.","GET /v1/ai/chat/history?restaurant_id=X&session_id=X&limit=20 on load"],
      ["Quick Prompts row","Horizontal scroll of 6 chips: 'How did we do this week?' · 'When is payroll due?' · 'What did we spend on food?' · 'Top 5 vendors this month' · 'Any compliance deadlines soon?' · 'Show me cash flow forecast'","Tap = auto-fill input + send. POST /v1/ai/chat/message"],
      ["Text input","Textarea. Send on Enter or button. Shift+Enter = new line.","POST /v1/ai/chat/message { restaurant_id, session_id, content }"],
      ["Voice button (🎤)","Hold to record. Release to send. Show waveform animation while recording.","POST /v1/ai/chat/voice (multipart audio) → transcribed server-side → same as text message"],
      ["Attach button (📎)","File picker. Image or PDF. Show thumbnail preview.","POST /v1/files/presign → S3 → POST /v1/ai/chat/message with attachment s3_key"],
      ["AI response stream","Text appears word-by-word via SSE. Show cursor animation while streaming.","SSE stream from POST /v1/ai/chat/message"],
      ["Action Card","Sometimes AI replies with a card: e.g. 'Approve Payroll — $12,450 for 18 employees' with [Approve] [Review First] buttons.","[Approve] → POST /v1/ai/chat/action { action_type: approve_payroll, entity_id }. [Review First] → navigate to /payroll/current"],
      ["Agent status indicator","Green dot = ready. Animated ring = AI is processing. Never show 'offline'.","Live from SSE connection state"],
      ["Escalate to Human button","Top-right of chat header. Always visible.","POST /v1/ai/chat/escalate → shows 'Our team will respond within 2 hours' + estimated wait time from API"],
      ["Search button (🔍)","Opens search bar above chat. Full-text across all history.","GET /v1/ai/chat/search?q=&restaurant_id=X"],
    ],[2600,3400,3360],C.blue),
    sp(),

    h2("3.10 Settings Screen"),
    tbl(["Tab","Elements","API"],[
      ["Profile","Name (editable) · Email (read-only, contact support to change) · Phone · Timezone · Avatar upload · Change Password button · Enable/Disable MFA toggle","GET /v1/users/me on load. PUT /v1/users/me on save. POST /v1/auth/change-password. PUT /v1/users/me/mfa"],
      ["Team","List of all users with access to this restaurant: name, role, status, last active. Invite button. Remove button per row.","GET /v1/restaurants/:id/team. POST /v1/restaurants/:id/invite { email, role }. DELETE /v1/restaurants/:id/team/:user_id"],
      ["Billing","Current plan name · Monthly cost · Next billing date · Payment method (last 4 digits) · Upgrade button · Invoice history table","GET /v1/billing/subscription?restaurant_id=X. POST /v1/billing/upgrade { tier }. GET /v1/billing/invoices"],
      ["Integrations","Cards per integration: POS (Square/Toast/Clover) · Bank (Plaid) · Accounting (QuickBooks/Xero) · Payroll (Gusto/ADP). Each card: status badge + Connect/Disconnect button.","GET /v1/integrations?restaurant_id=X. POST /v1/integrations/:type/connect. DELETE /v1/integrations/:type/disconnect"],
      ["Notifications","Toggle per notification type: Payroll Due · Invoice Received · Compliance Deadline · AI Insight · Low Cash Alert. Channel toggles: Email · Push · SMS.","GET /v1/users/me/notification-prefs. PUT /v1/users/me/notification-prefs { prefs object }"],
    ],[1800,5400,2160],C.blue),
    pb()
  ];
}

// ─── SECTION 4: MOBILE APP ─────────────────────────────────────────────────
function sec4(){
  return [
    h1("4. Mobile App (iOS + Android) — All Screens & Buttons"),
    warn("Mobile = same real APIs as web. NO separate mobile mock endpoints. Every screen fetches from same /v1/ API with Authorization header."),
    sp(),

    h2("4.1 Bottom Tab Navigation"),
    tbl(["Tab","Icon","Badge Logic","Visible To"],[
      ["Home","🏠","Red dot if unread notifications","owner, manager"],
      ["Payroll","💰","'PENDING' chip if status=pending_approval","owner only — hidden from manager"],
      ["Reports","📊","—","owner, advisor"],
      ["AI Chat","🤖","—","owner, manager"],
      ["Settings","⚙️","—","owner only"],
    ],[1800,800,3600,3160],C.navy),
    sp(),

    h2("4.2 Mobile Home Screen"),
    tbl(["Element","Behavior","API"],[
      ["P&L Card","Swipeable card at top. Revenue / Expenses / Net Profit. Tap to full detail.","GET /v1/dashboard/summary (mobile returns same JSON)"],
      ["Payroll Banner","Full-width yellow banner. Only shows if pending. Amount + employee count + due date.","dashboard.payroll from summary"],
      ["AI Insights (horizontal scroll)","3 insight cards. Swipe to dismiss (calls DELETE). Tap for detail.","GET /v1/ai/insights (cached 1hr)"],
      ["Quick Actions (3 big buttons)","Log Sale · Submit Expense · Message Agent. Full-width on mobile.","Each opens bottom sheet modal"],
      ["Vendor Payments (list)","3 upcoming payments. 'Pay Now' button per row.","dashboard.vendor_dues"],
      ["Pull to Refresh","Standard mobile pull-down gesture","Re-fetches GET /v1/dashboard/summary + GET /v1/ai/insights"],
    ],[2200,3400,3760],C.teal),
    sp(),

    h2("4.3 Mobile Payroll Screen"),
    tbl(["Element","Behavior","API"],[
      ["Pay Period picker","Bottom sheet picker, not dropdown.","GET /v1/payroll/runs list for picker"],
      ["Employee list (scrollable)","Each row: name, hours, net pay, flag badge. Tap row for detail bottom sheet.","GET /v1/payroll/runs/current → line_items array"],
      ["Anomaly badge","Yellow ⚠ on affected rows. Tap → bottom sheet with AI explanation.","GET /v1/payroll/line-items/:id/anomaly-detail"],
      ["Approve All (large CTA)","Full-width green button at bottom. Sticky — stays visible on scroll.","Confirm bottom sheet → POST /v1/payroll/runs/:id/approve"],
      ["Flag for Review (swipe left)","Swipe left on employee row to reveal Flag action.","POST /v1/payroll/line-items/:id/flag"],
      ["Reject (swipe right)","Swipe right on payroll header → opens comment field.","POST /v1/payroll/runs/:id/reject"],
      ["Download PDF","Share icon top-right.","GET /v1/payroll/runs/:id/pdf → open in native share sheet"],
    ],[2200,3400,3760],C.green),
    sp(),

    h2("4.4 Mobile-Specific Features"),
    tbl(["Feature","How It Works","API"],[
      ["Biometric login","Face ID / fingerprint on app open after first login","POST /v1/auth/refresh (using stored refresh token, not biometric data sent to server)"],
      ["Push notifications","Native iOS/Android push via Expo Push Service","Received from Notification Service. Tap opens deep link to relevant screen."],
      ["Camera — Invoice Upload","Tap paperclip in AI chat or Upload in Invoices → native camera opens. Crop + rotate tools.","POST /v1/files/presign → multipart upload → POST /v1/invoices/confirm"],
      ["Voice input in AI Chat","Hold mic button. Shows waveform. Release to transcribe + send.","POST /v1/ai/chat/voice (audio blob)"],
      ["Offline mode","Shows last fetched data with 'Last updated X min ago' banner. All action buttons disabled with tooltip: 'Requires internet connection'.","No API calls offline. Data from React Query cache only."],
      ["Deep links","Push notification taps open: payroll → /payroll/current, invoice → /invoices/:id, compliance → /compliance/:id","React Navigation deep link routing"],
    ],[2200,3400,3760],C.blue),
    pb()
  ];
}

// ─── SECTION 5: ADMIN PLATFORM ─────────────────────────────────────────────
function sec5(){
  return [
    h1("5. Admin Operations Platform (admin.restroops.ai)"),
    rule("This platform is ONLY for super_admin and ops_manager roles. Any request with a different role JWT must return 403 immediately — before any DB query."),
    sp(),

    h2("5.1 Admin Sidebar Navigation"),
    tbl(["Menu Item","Visible To","Badge"],[
      ["📊 Overview Dashboard","super_admin, ops_manager","—"],
      ["⚡ Exception Queue","super_admin, ops_manager","Count of open exceptions from GET /admin/exceptions/count"],
      ["🏪 Accounts","super_admin, ops_manager","Count of at-risk accounts (health_score<40)"],
      ["👤 Staff Management","super_admin only","—"],
      ["💳 Billing","super_admin only","Count of past-due accounts"],
      ["⚙️ System Settings","super_admin only","—"],
      ["🚩 Feature Flags","super_admin only","—"],
    ],[2400,2800,4160],C.red),
    sp(),

    h2("5.2 Admin Overview Dashboard"),
    tbl(["Widget","Data Shown","API"],[
      ["MRR Card","Total monthly recurring revenue across all active subscriptions","GET /v1/admin/metrics/mrr"],
      ["Active Accounts count","Number of restaurants with status=active","GET /v1/admin/metrics/accounts"],
      ["AI Automation Rate","% of tasks resolved by AI with no human touch. Last 30 days.","GET /v1/admin/metrics/automation-rate"],
      ["Open Exceptions count","Total exceptions with status=open, grouped by type","GET /v1/admin/exceptions/count"],
      ["Churn Risk list","Accounts with health_score<40 or no login in 14d","GET /v1/admin/accounts?risk=true&limit=5"],
      ["System Health panel","Status of: Postgres · Redis · BullMQ queue depth · AI service · Integrations","GET /v1/admin/system/health — never cache this"],
      ["Exception Rate chart","Line chart: exceptions/day over last 30 days","GET /v1/admin/metrics/exception-rate?period=30d"],
    ],[2400,3200,3760],C.red),
    sp(),

    h2("5.3 Exception Queue — Every Button"),
    banner("GET /v1/admin/exceptions?status=open&assigned_to=me — ops_manager sees only their assigned accounts",C.red,C.rl),
    sp(),
    tbl(["Element","Behavior","API"],[
      ["Queue table","Columns: Restaurant · Type · Created · AI Confidence · Assigned To · SLA Remaining. Sorted by priority score.","GET /v1/admin/exceptions?status=open&sort=priority"],
      ["Priority score (shown as bar)","Visual bar: red=critical, orange=high, yellow=medium. Calculated: (1-confidence) × urgency × age.","Returned in exceptions array as priority_score field"],
      ["SLA Timer","Countdown per row. Red if <2hr, orange if <4hr.","Calculated: SLA target - (now - created_at). SLA targets: payroll/compliance=4hr, invoices=8hr."],
      ["Assign To Me button","Per row. Only shows if exception is unassigned.","POST /v1/admin/exceptions/:id/assign { ops_manager_id: me }"],
      ["Unassign button","Per row. Only on exceptions assigned to me.","DELETE /v1/admin/exceptions/:id/assign"],
      ["Open Exception button","Per row. Opens full Resolution Panel.","GET /v1/admin/exceptions/:id/detail"],
      ["Resolution Panel","Side panel / modal. Shows: AI reasoning text · Source data (table) · AI recommendation · Confidence score · Accept AI button · Override button.","Populated from exception detail response"],
      ["Accept AI Recommendation","Primary green button in panel.","POST /v1/admin/exceptions/:id/resolve { resolution: accepted_ai }"],
      ["Override AI button","Secondary button. Opens reason dropdown + corrected value field.","POST /v1/admin/exceptions/:id/resolve { override:true, override_reason, corrected_value }"],
      ["Escalate button","In panel. Sends to senior manager or super_admin.","POST /v1/admin/exceptions/:id/escalate { escalate_to: role }"],
      ["Filters bar","Filter: Type · Restaurant · Assigned To · SLA Status · Date Range","All append as query params to GET /v1/admin/exceptions"],
      ["Analytics tab","Charts: exceptions by type, avg time to resolve, top exception accounts","GET /v1/admin/exceptions/analytics?period=30d"],
    ],[2600,3600,3160],C.red),
    rule("Override reason is mandatory. Dropdown options (not free text): client_preference · data_not_in_system · ai_model_error · special_circumstance. Free text note is optional but logged."),
    sp(),

    h2("5.4 Account Management Screen"),
    tbl(["Element","Behavior","API"],[
      ["Account List","Columns: Restaurant · Tier · MRR · Health Score · Ops Manager · Last Active · Status. Searchable.","GET /v1/admin/accounts?page=1&limit=20&q="],
      ["Health Score bar","0-100. Red<40, Orange<70, Green>=70. Click for breakdown.","GET /v1/admin/accounts/:id/health-detail — shows 5 component scores"],
      ["Open Account button","Opens full account view (new page or side panel).","GET /v1/admin/accounts/:id"],
      ["Account view tabs","Overview · Payroll · Accounting · Vendors · Compliance · Activity Log · Notes","Each tab fetches its own endpoint with restaurant_id as admin context"],
      ["Activity Log tab","Chronological: actor, action, entity, timestamp. Filter by actor type.","GET /v1/admin/accounts/:id/activity?page=1"],
      ["Internal Notes field","Text area. Ops Manager notes visible only to RestroOps staff.","GET /v1/admin/accounts/:id/notes. POST to save."],
      ["Suspend Account button","Red button. Requires reason from dropdown + confirmation modal.","POST /v1/admin/accounts/:id/suspend { reason } — immediately blocks owner JWT"],
      ["Unsuspend button","Only shows if status=suspended.","POST /v1/admin/accounts/:id/unsuspend"],
      ["Change Tier button","Dropdown of tiers. Shows prorated cost difference.","POST /v1/admin/accounts/:id/change-tier { tier } — Stripe handles proration"],
      ["Impersonate User button","super_admin and ops_manager only. Shows warning: 'This action is logged.'","POST /v1/admin/accounts/:id/impersonate → returns impersonation JWT. All actions during impersonation tagged in audit log."],
      ["Assign Ops Manager","Dropdown of available ops_managers. super_admin only.","PUT /v1/admin/accounts/:id { assigned_manager_id }"],
    ],[2600,3600,3160],C.red),
    sp(),

    h2("5.5 Staff Management (super_admin only)"),
    tbl(["Element","Behavior","API"],[
      ["Staff List","All ops_manager accounts: name, email, account count, last login, status.","GET /v1/admin/staff"],
      ["Create Ops Manager button","Form: name, email, password (auto-generated), send invite email.","POST /v1/admin/staff { name, email, role: ops_manager }"],
      ["Deactivate button","Per row. Removes access immediately. Reassigns their accounts.","POST /v1/admin/staff/:id/deactivate + PUT bulk reassign accounts"],
      ["Account Assignment","Drag-and-drop or multi-select accounts to assign to an ops_manager.","PUT /v1/admin/accounts/:id { assigned_manager_id }"],
    ],[2600,3600,3160],C.red),
    sp(),

    h2("5.6 Feature Flags (super_admin only)"),
    tbl(["Element","Behavior","API"],[
      ["Flags list","All feature flags with: name, description, current state (on/off), scope (global/per-account).","GET /v1/admin/feature-flags"],
      ["Global toggle","Enable/disable feature for ALL accounts.","PUT /v1/admin/feature-flags/:key { enabled: true/false }"],
      ["Per-account override","Search for a restaurant, toggle flag just for them.","PUT /v1/admin/feature-flags/:key/overrides { restaurant_id, enabled }"],
      ["Flag names (examples)","invoice_ocr · inventory_module · vendor_portal · multi_location · qbo_export · langchain_v2","Each flag gates a feature in both frontend (hide UI) and backend (403 if flag off)"],
    ],[2600,3600,3160],C.red),
    pb()
  ];
}

// ─── SECTION 6: REAL-TIME RULES ───────────────────────────────────────────
function sec6(){
  return [
    h1("6. Real-Time & Anti-Mock-Data Rules"),
    warn("These rules must be enforced in code review. Any PR that introduces hardcoded data, setTimeout fake loaders, or static JSON responses is rejected."),
    sp(),

    h2("6.1 Loading States — Mandatory"),
    tbl(["State","When It Shows","How To Implement"],[
      ["Skeleton loader","From the moment fetch starts until data arrives","Use shadcn Skeleton component on every data field. No spinner-only screens."],
      ["Empty state","When API returns data:[] or data:null","Show empty state illustration + message. E.g. 'No invoices yet. Upload your first invoice.'"],
      ["Error state","When API returns 4xx or 5xx or network timeout","Show error message + 'Retry' button that re-triggers the fetch. Log to Sentry."],
      ["Optimistic update","For fast actions (recategorize, dismiss insight, flag row)","Update UI immediately. Revert + show error toast if API fails."],
      ["Success toast","After any write action completes","Auto-dismiss after 3 seconds. Bottom of screen on mobile, top-right on web."],
    ],[2200,2800,4360],C.navy),
    sp(),

    h2("6.2 Polling & Real-Time Updates"),
    tbl(["Data","Update Method","Frequency"],[
      ["Dashboard widgets","React Query refetchInterval","60 seconds"],
      ["Payroll status","Supabase Realtime WebSocket subscription","Instant push on status change"],
      ["AI chat responses","Server-Sent Events (SSE) stream","Token-by-token streaming"],
      ["Exception queue (admin)","React Query refetchInterval","30 seconds"],
      ["Notification badge count","React Query refetchInterval","60 seconds"],
      ["System health (admin)","React Query refetchInterval","15 seconds — never cache"],
      ["Staff on shift","React Query refetchInterval","120 seconds"],
    ],[2400,3200,3760],C.navy),
    sp(),

    h2("6.3 Forbidden Patterns (Code Review Checklist)"),
    rule("setTimeout(() => setLoading(false), 2000) — NEVER fake a loading delay"),
    rule("const data = { revenue: 48200 } — NEVER hardcode any business data"),
    rule("if (DEV) return mockData — NEVER have a mock data branch"),
    rule("Math.random() for any displayed value — NEVER generate fake metrics"),
    rule("// TODO: connect to API — no TODOs in merged code. If not built, hide behind feature flag."),
    rule("Empty catch blocks — ALWAYS surface errors. Log to Sentry. Show error state to user."),
    pb()
  ];
}

// ─── SECTION 7: API STRUCTURE ─────────────────────────────────────────────
function sec7(){
  return [
    h1("7. API Structure & Response Standards"),
    h2("7.1 Every API Response Format"),
    p("All responses — success or error — follow this exact format:"),
    sp(),
    tbl(["Field","Type","Always Present","Description"],[
      ["success","boolean","Yes","true = 2xx. false = 4xx/5xx"],
      ["message","string","Yes","Human-readable summary. Shown in toast on frontend."],
      ["data","object or null","Yes","Payload on success. null on error."],
      ["error","object or null","Yes","null on success. Error detail on failure."],
      ["meta","object or null","No","Pagination info: { page, limit, total, total_pages }"],
    ],[1600,1400,1800,4560],C.navy),
    sp(),

    h2("7.2 Error Codes — Standard Set"),
    tbl(["HTTP Code","When Used","Frontend Action"],[
      ["400 Bad Request","Validation failed. error.fields shows which fields failed.","Show inline field errors. Do not clear form."],
      ["401 Unauthorized","Token expired or invalid.","Auto-call POST /auth/refresh. If that fails → redirect to /login."],
      ["403 Forbidden","Valid token but wrong role for this action.","Show: 'You do not have permission to do this.' Do not redirect."],
      ["404 Not Found","Entity does not exist or wrong restaurant_id.","Show empty state or 'Not found' page."],
      ["409 Conflict","Duplicate (e.g. vendor already exists, payroll already approved).","Show specific message from response.message."],
      ["422 Unprocessable","Business logic error (e.g. approve total mismatch).","Show specific message. Do not retry automatically."],
      ["429 Too Many Requests","Rate limit hit. response includes retry_after seconds.","Show countdown: 'Please wait X seconds.' Disable button."],
      ["500 Server Error","Unexpected backend failure.","Show: 'Something went wrong. Our team has been notified.' Log to Sentry with request details."],
    ],[1400,3200,4760],C.navy),
    sp(),

    h2("7.3 Authentication on Every Request"),
    tbl(["Header","Value","Required On"],[
      ["Authorization","Bearer <access_token>","ALL /v1/ endpoints except /auth/login, /auth/forgot-password"],
      ["X-Restaurant-ID","uuid of active restaurant","All owner/manager requests. Used for additional validation beyond JWT."],
      ["X-Request-ID","client-generated UUID v4","All requests. Used for Sentry correlation and audit logging."],
    ],[2400,4000,2960],C.navy),
    rule("Backend must verify restaurant_id in X-Restaurant-ID header matches the restaurant_ids in the JWT payload. Even if JWT is valid, a restaurant_id not in the JWT list must return 403."),
    pb()
  ];
}

// ─── SECTION 8: DATABASE RULES ────────────────────────────────────────────
function sec8(){
  return [
    h1("8. Database Rules — No Exceptions"),
    warn("These are not suggestions. These rules prevent data leaks between restaurants."),
    sp(),
    rule("Every table that holds restaurant data MUST have a restaurant_id column with a Supabase RLS policy. No exceptions."),
    rule("RLS policy on every table: USING (restaurant_id = (SELECT restaurant_id FROM users WHERE id = auth.uid())). Applied to SELECT, INSERT, UPDATE, DELETE."),
    rule("The audit_log table has NO UPDATE and NO DELETE RLS policy. It is append-only. Even super_admin cannot delete audit records."),
    rule("Soft deletes only. Never DELETE rows. Use deleted_at TIMESTAMPTZ. All queries filter WHERE deleted_at IS NULL."),
    rule("No raw SQL from application code. Use parameterized queries (Supabase client or pg library with $1 params). ORM query builders are acceptable."),
    rule("All financial amounts stored as NUMERIC(12,2). Never FLOAT. Floating point causes rounding errors in money."),
    rule("All timestamps stored as TIMESTAMPTZ (with timezone). Convert to user's restaurant timezone only at display time."),
    sp(),
    tbl(["Table","RLS Policy Summary","Delete Policy"],[
      ["restaurants","owner/manager/advisor can read own restaurant. super_admin/ops_manager read all assigned.","Soft delete only"],
      ["users","Can only read own user row. super_admin reads all. ops_manager reads assigned restaurant users.","Deactivate flag, not delete"],
      ["transactions","Scoped to restaurant_id. advisor = read-only. manager = read-only.","Soft delete (deleted_at)"],
      ["payroll_runs","Scoped to restaurant_id. manager cannot read.","Soft delete. Approved runs immutable."],
      ["invoices","Scoped to restaurant_id. manager = insert only.","Soft delete"],
      ["employees","Scoped to restaurant_id. manager = read name+contact+schedule only.","Soft delete via status=terminated"],
      ["compliance_items","Scoped to restaurant_id. Only ops_manager/super_admin can update status.","Soft delete"],
      ["ai_exceptions","Only super_admin and ops_manager can read/write.","No delete — permanent record"],
      ["audit_log","All roles can read their own actions. super_admin reads all. NO writes except via audit service.","NO DELETE. EVER."],
    ],[2400,4200,2760],C.navy),
    pb()
  ];
}

// ─── SECTION 9: NOTIFICATIONS ─────────────────────────────────────────────
function sec9(){
  return [
    h1("9. Notification System — Every Trigger"),
    note("Notifications are sent by the Notification Service — a separate microservice. The main API never sends emails/SMS directly. It enqueues a notification job via BullMQ."),
    sp(),
    tbl(["Trigger Event","Recipient","Channels","Message","Action Link"],[
      ["Payroll draft ready","owner","Push + Email","Your Jun 1–14 payroll is ready. $12,450 for 18 employees.","Deep link → /payroll/current"],
      ["Payroll approved","owner","Push","Payroll approved ✅ Payment processes on [date].","Deep link → /payroll/current"],
      ["Payroll rejected","ops_manager","Admin web + Email","Payroll rejected by owner at [restaurant]. Comment: [comment].","Link → /admin/exceptions"],
      ["Invoice received (auto)","owner","Push","New invoice from [Vendor] — $X. AI is processing.","Deep link → /invoices"],
      ["Invoice discrepancy","owner","Push + Email","Invoice from [Vendor] is $X higher than usual (+Y%). Review recommended.","Deep link → /invoices/:id"],
      ["Compliance due in 30 days","owner","Email","[Filing type] due in 30 days. RestroOps will prepare your draft.","Link → /compliance"],
      ["Compliance due in 7 days","owner","Push + Email","[Filing type] due in 7 days. Draft ready for your review.","Deep link → /compliance/:id"],
      ["Compliance due in 1 day","owner","Push + Email (URGENT)","URGENT: [Filing type] due TOMORROW. Please approve the draft.","Deep link → /compliance/:id"],
      ["Compliance overdue","owner + ops_manager","Push + Email + SMS","OVERDUE: [Filing type] was due on [date]. Immediate action needed.","Deep link → /compliance/:id"],
      ["Cash flow alert (low)","owner","Push + Email","Cash flow forecast shows potential shortfall in 12 days.","Deep link → /accounting/cash-flow"],
      ["Exception assigned","ops_manager","Admin web + Email","New exception: [type] at [restaurant]. SLA: 4 hours.","Link → /admin/exceptions/:id"],
      ["SLA breach warning","ops_manager","Admin web + Email","Exception #X SLA breach in 90 minutes. Currently unassigned.","Link → /admin/exceptions/:id"],
      ["Account payment failed","super_admin","Admin web + Email","BILLING: Payment failed for [restaurant]. $X past due.","Link → /admin/accounts/:id"],
      ["New team member invite","invitee (manager/advisor)","Email","[Owner name] has invited you to access [Restaurant] on RestroOps AI. [Accept Invite] button.","Magic link → /accept-invite?token=X"],
    ],[2600,1600,1600,2800,2760],C.purple),
    pb()
  ];
}

// ─── FINAL ─────────────────────────────────────────────────────────────────
function final(){
  return [
    h1("10. Build Order — Phase 1 Must-Haves"),
    p("Build in this exact order. Nothing is 'done' until the UI shows real API data with proper loading, error, and empty states."),
    sp(),
    tbl(["Order","Feature","Blocks What"],[
      ["1","Database schema + RLS policies + Supabase Auth setup","Everything"],
      ["2","JWT auth flow (login, MFA, refresh, logout)","All protected routes"],
      ["3","Role middleware on all API routes","All role-gated features"],
      ["4","Admin: account management + exception queue (basic)","Ops team operations"],
      ["5","Owner: dashboard (summary API)","First client-facing value"],
      ["6","Payroll module (draft, approve, reject)","Core value prop"],
      ["7","Accounting: Plaid bank feed + auto-categorize + P&L","Core value prop"],
      ["8","AI Chat (basic Q&A with tool calls)","Differentiator"],
      ["9","Notifications (push + email)","Compliance + payroll critical path"],
      ["10","Reports (PDF generation)","Client deliverable"],
    ],[600,4000,4760],C.green),
    sp(),
    new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:400,after:200},
      border:{top:{style:BorderStyle.SINGLE,size:6,color:C.navy}},
      children:[new TextRun({text:"— End of RestroOps AI Full Build Guide —",font:"Arial",size:22,bold:true,color:C.navy})]}),
    new Paragraph({alignment:AlignmentType.CENTER,
      children:[new TextRun({text:"Real data only. No mocks. No demos.",font:"Arial",size:20,color:C.red,bold:true})]})
  ];
}

// ── BUILD ────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering:{config:[{reference:"bullets",levels:[
    {level:0,format:LevelFormat.BULLET,text:"•",alignment:AlignmentType.LEFT,
      style:{paragraph:{indent:{left:560,hanging:280}}}},
  ]}]},
  styles:{
    default:{document:{run:{font:"Arial",size:20}}},
    paragraphStyles:[
      {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:34,bold:true,font:"Arial",color:C.navy},
        paragraph:{spacing:{before:360,after:160},outlineLevel:0}},
      {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:26,bold:true,font:"Arial",color:C.blue},
        paragraph:{spacing:{before:260,after:120},outlineLevel:1}},
      {id:"Heading3",name:"Heading 3",basedOn:"Normal",next:"Normal",quickFormat:true,
        run:{size:22,bold:true,font:"Arial",color:C.teal},
        paragraph:{spacing:{before:180,after:80},outlineLevel:2}},
    ]
  },
  sections:[{
    properties:{page:{size:{width:12240,height:15840},margin:{top:1080,right:1080,bottom:1080,left:1080}}},
    headers:{default:new Header({children:[new Paragraph({
      border:{bottom:{style:BorderStyle.SINGLE,size:4,color:C.navy,space:6}},
      spacing:{after:80},
      children:[
        new TextRun({text:"RestroOps AI — Full Build Guide",font:"Arial",size:18,bold:true,color:C.navy}),
        new TextRun({text:"   |   NO MOCK DATA — REAL-TIME ONLY",font:"Arial",size:18,color:C.red}),
      ]
    })]})},
    children:[
      ...cover(),
      ...sec1(),
      ...sec2(),
      ...sec3(),
      ...sec4(),
      ...sec5(),
      ...sec6(),
      ...sec7(),
      ...sec8(),
      ...sec9(),
      ...final(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf=>{
  fs.writeFileSync('/home/claude/RestroOps_Full_Build_Guide.docx',buf);
  console.log('Done');
}).catch(e=>{console.error(e);process.exit(1);});