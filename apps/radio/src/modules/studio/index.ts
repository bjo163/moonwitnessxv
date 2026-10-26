import { FIELD_INPUT_SPEC, inputKindFor } from '@moonwitness/core'
import type { TypedModule } from '../../lib/types.js'

// Studio -> mounted at <apiPrefix>/studio
// A zero-build, metadata-driven admin: the page below is a static shell that
// renders models, views and forms purely from GET /_schema + the auto-REST
// routes. All data access goes through the same ACL-enforced API — Studio
// has no privileged backend of its own, so the shell itself is public and
// useless without a token. Demo-grade on purpose.
// Rendered values go through esc() (text) or attr() (attribute values); row
// actions use data-* attributes and one delegated listener, never inline JS.
// The schema-property -> control decision is NOT re-derived here: `core` owns
// that table and it is injected into the page below, so Studio and the React
// frontends cannot disagree about what a field wants to be.

const STUDIO_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Moonql Studio</title>
<style>
  :root { --ink:#07060b; --paper:#0d0b14; --surface:#13101d; --fg:#f7f4ec; --accent:#ffd400; --pink:#ff007a; --hot:#ff1e56; }
  * { box-sizing: border-box; font-family: ui-monospace, "Cascadia Code", Menlo, monospace; }
  body { margin:0; background:var(--ink); color:var(--fg); }
  header { border-bottom:3px solid var(--fg); padding:14px 20px; background:var(--surface);
    display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  header h1 { font-size:20px; margin:0; letter-spacing:-1px; }
  header .tag { border:2px solid var(--fg); padding:2px 8px; background:var(--accent); color:#07060b; font-weight:800; }
  main { display:grid; grid-template-columns: 260px 1fr; gap:20px; padding:20px; }
  nav { border:2px solid var(--fg); background:var(--surface); box-shadow:4px 4px 0 #000; padding:12px; }
  nav h2 { font-size:13px; text-transform:uppercase; margin:10px 0 4px; border-bottom:2px solid var(--ink); }
  nav button { display:block; width:100%; text-align:left; margin:2px 0; padding:6px 8px;
    border:2px solid var(--ink); background:#fff; font-weight:700; cursor:pointer; }
  nav button:hover, nav button.on { background:var(--accent); }
  section { border:2px solid var(--fg); background:var(--surface); box-shadow:4px 4px 0 #000; padding:16px; min-height:70vh; }
  .row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:12px; }
  input, select, textarea { border:2px solid rgba(247,244,236,.45); padding:6px 8px; background:var(--paper); color:var(--fg); font-weight:700; }
  .btn { border:3px solid var(--ink); background:var(--accent); padding:7px 14px; font-weight:800; cursor:pointer; box-shadow:3px 3px 0 var(--ink); }
  .btn.danger { background:#fff; color:var(--hot); }
  table { border-collapse:collapse; width:100%; font-size:13px; }
  th, td { border:2px solid var(--ink); padding:5px 8px; text-align:left; vertical-align:top; max-width:340px; overflow:hidden; }
  th { background:rgba(255,0,122,.16); color:var(--accent); }
  .muted { opacity:.6; font-size:12px; }
  .err { color:var(--hot); font-weight:800; }
  .card { border:3px solid var(--ink); padding:12px; margin:8px 0; box-shadow:4px 4px 0 var(--ink); }
  #msg { font-weight:800; }
</style>
</head>
<body>
<header>
  <h1>MOONQL STUDIO</h1>
  <span class="tag">view-driven admin</span>
  <span class="muted">rendered entirely from GET /_schema — no privileged backend</span>
</header>
<main>
  <nav id="nav"><div class="row"><b>Not logged in.</b></div></nav>
  <section id="out"><div class="card" id="login">
    <h2>LOGIN</h2>
    <div class="row"><input id="user" placeholder="login" value="admin"></div>
    <div class="row"><input id="pass" type="password" placeholder="password"></div>
    <div class="row"><button class="btn" id="doLogin">Sign in</button>
      <input id="token" placeholder="...or paste bearer token" style="flex:1"></div>
    <div id="msg"></div>
  </div></section>
</main>
<script>
(function () {
  "use strict";
  /* derive the API root from this page's own route: <prefix>/studio -> <prefix>
     kelas karakter, bukan backslash: sumber ini hidup di dalam template string, dan
     "\\/" di sana adalah escape string yang menghasilkan "/" — regex yang diterima
     browser jadi berbeda dari yang ditulis. */
  var API = location.pathname.replace(/[/]studio[/]?$/, "");
  var token = sessionStorage.getItem("mw_token") || "";

  function esc(v) {
    if (v === null || v === undefined) return "";
    var d = document.createElement("div"); d.textContent = String(typeof v === "object" ? JSON.stringify(v) : v);
    return d.innerHTML;
  }
  /* text escaping does not cover attributes: a quote ends them */
  function attr(v) {
    return String(v === null || v === undefined ? "" : v)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function h(tag, attrs, inner) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "onclick") el.addEventListener("click", attrs[k]); else el.setAttribute(k, attrs[k]); }
    el.innerHTML = inner || "";
    return el;
  }
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ "content-type": "application/json" }, opts.headers || {});
    if (token) opts.headers["authorization"] = "Bearer " + token;
    return fetch(API + path, opts).then(function (r) {
      if (r.status === 204) return { ok: true, data: null, status: r.status };
      return r.json().then(function (j) { j.status = r.status; return j; });
    });
  }
  function show(html) { document.getElementById("out").innerHTML = html; }
  function msg(t, bad) { var m = document.getElementById("msg"); m.textContent = t; m.className = bad ? "err" : ""; }

  /* one delegated listener instead of generated onclick="…" strings */
  document.getElementById("out").addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest("[data-act]") : null;
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    var model = btn.getAttribute("data-model");
    var id = btn.getAttribute("data-id");
    if (act === "edit") window.__edit(model, id);
    else if (act === "del") window.__del(model, id);
  });

  var schema = null;

  /*
   * The shared field table, borrowed rather than copied. The function below is the
   * exported inputKindFor's own source, so there is still exactly one definition of
   * the rule in the repository - the same one headquarters renders through React.
   */
  var FIELD_INPUT_SPEC = ${JSON.stringify(FIELD_INPUT_SPEC)};
  var inputKindFor = ${inputKindFor.toString()};

  function boot() {
    if (!token) return;
    api("/_schema").then(function (j) {
      if (!j.ok) { msg(j.error ? j.error.message : "schema failed", true); return; }
      schema = j.data;
      renderNav();
      var first = Object.keys(schema.models)[0];
      if (first) openModel(first);
    });
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    nav.innerHTML = "";
    nav.appendChild(h("h2", null, "Models"));
    Object.keys(schema.models).forEach(function (name) {
      var m = schema.models[name];
      nav.appendChild(h("button", { onclick: function () { openModel(name); } },
        esc(m.label || name) + ' <em style="opacity:.5;font-size:10px">' + esc(m.dataTier || "none") + "</em>"));
    });
    nav.appendChild(h("h2", null, "Views"));
    Object.keys(schema.views).forEach(function (key) {
      var v = schema.views[key];
      nav.appendChild(h("button", { onclick: function () { openView(key); }, title: "from " + v.from }, esc(v.label || key)));
    });
    nav.appendChild(h("h2", null, "Endpoints"));
    schema.endpoints.forEach(function (e) {
      if (e.method === "GET") nav.appendChild(h("button", { onclick: function () { raw(e.path); } }, esc(e.path)));
      else nav.appendChild(h("div", { class: "muted" }, esc(e.method + " " + e.path)));
    });
    nav.appendChild(h("h2", null, "Session"));
    nav.appendChild(h("button", { onclick: function () { api("/auth/logout", { method: "POST" }).then(logout); } }, "Log out"));
  }

  function logout() { sessionStorage.removeItem("mw_token"); token = ""; location.reload(); }

  function table(rows, name, actions) {
    if (!rows || !rows.length) return '<div class="card">No rows.</div>';
    var cols = Object.keys(rows[0]);
    var html = '<table><thead><tr>';
    cols.forEach(function (c) { html += "<th>" + esc(c) + "</th>"; });
    if (actions) html += "<th>ops</th>";
    html += "</tr></thead><tbody>";
    rows.forEach(function (r) {
      html += "<tr>";
      cols.forEach(function (c) { html += "<td>" + esc(r[c]) + "</td>"; });
      if (actions) html += '<td><button class="btn" data-act="edit" data-model="' + attr(name) + '" data-id="' + attr(r.id) + '">edit</button> ' +
        '<button class="btn danger" data-act="del" data-model="' + attr(name) + '" data-id="' + attr(r.id) + '">del</button></td>';
      html += "</tr>";
    });
    return html + "</tbody></table>";
  }

  function form(modelName, m) {
    var s = m.createSchema;
    if (!s) return "";
    var req = s.required || [];
    var html = '<div class="card"><h2>CREATE ' + esc(m.label || modelName) + '</h2><form id="cf">';
    Object.keys(s.properties).forEach(function (key) {
      var p = s.properties[key];
      var label = "<label>" + esc(key) + (req.indexOf(key) >= 0 ? " *" : "") + "</label><br>";
      var kind = inputKindFor(p);
      var spec = FIELD_INPUT_SPEC[kind] || FIELD_INPUT_SPEC.string;
      if (spec.input === "select" && p.enum) {
        html += label + "<select name='" + esc(key) + "'>";
        if (req.indexOf(key) < 0) html += "<option value=''></option>";
        p.enum.forEach(function (o) { html += "<option>" + esc(o) + "</option>"; });
        html += "</select><br><br>";
      } else if (spec.input === "checkbox") {
        // hidden first, checkbox last: FormData keeps the last value, so "off" is sendable
        html += label + "<input type='hidden' name='" + esc(key) + "' value='false'>" +
          "<input type='checkbox' name='" + esc(key) + "' value='true'><br><br>";
      } else {
        html += label + "<input name='" + esc(key) + "' type='" + spec.input + "'" +
          (spec.step ? " step='" + spec.step + "'" : "") +
          (p.maxLength ? " maxlength='" + p.maxLength + "'" : "") + "><br><br>";
      }
    });
    return html + '<button class="btn" type="submit">Create</button></form></div>';
  }

  function openModel(name) {
    var m = schema.models[name];
    api("/" + name + "?limit=50").then(function (j) {
      if (!j.ok) { show('<div class="card err">' + esc(j.error && j.error.message) + "</div>"); return; }
      var ops = m.operations || {};
      var canWrite = ops.create && (m.acl.create === "public" || token);
      show('<h2>' + esc(m.label || name) + ' <span class="muted">/' + esc(name) +
        " &middot; tier: " + esc(m.dataTier || "none") + " &middot; acl list: " + esc(JSON.stringify(m.acl.list || "public")) + "</span></h2>" +
        table(j.data, name, (ops.update || ops.remove) && token) +
        (canWrite ? form(name, m) : ""));
      var f = document.getElementById("cf");
      if (f) f.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var body = {};
        new FormData(f).forEach(function (v, k) {
          var p = m.createSchema.properties[k];
          if (v === "" && (m.createSchema.required || []).indexOf(k) < 0) return;
          body[k] = (p && (p.type === "integer" || p.type === "number")) ? Number(v) : v;
        });
        api("/" + name, { method: "POST", body: JSON.stringify(body) }).then(function (r) {
          if (r.ok) openModel(name); else alert(r.error ? r.error.message : "failed");
        });
      });
    });
  }

  function openView(key) {
    api("/" + key).then(function (j) {
      if (!j.ok) { show('<div class="card err">' + esc(j.error && j.error.message) + "</div>"); return; }
      var v = schema.views[key];
      show('<h2>' + esc(v.label || key) + ' <span class="muted">view of ' + esc(v.from) +
        (v.aggregate ? " (aggregate: " + esc(v.aggregate.metrics.join(", ")) + ")" : "") + "</span></h2>" + table(j.data, null, false));
    });
  }

  function raw(path) {
    api(path).then(function (j) {
      show("<h2>GET " + esc(path) + "</h2><pre class='card'>" + esc(JSON.stringify(j, null, 2)) + "</pre>");
    });
  }

  window.__del = function (name, id) {
    if (!confirm("Delete " + name + " " + id + "?")) return;
    api("/" + name + "/" + id, { method: "DELETE" }).then(function () { openModel(name); });
  };
  window.__edit = function (name, id) {
    var patch = prompt("PATCH body as JSON:");
    if (!patch) return;
    api("/" + name + "/" + id, { method: "PATCH", body: patch }).then(function (r) {
      if (!r.ok) alert(r.error ? r.error.message : "failed");
      openModel(name);
    });
  };

  document.getElementById("doLogin").addEventListener("click", function () {
    var login = document.getElementById("user").value;
    var password = document.getElementById("pass").value;
    api("/auth/login", { method: "POST", body: JSON.stringify({ login: login, password: password }) })
      .then(function (j) {
        if (!j.ok) { msg(j.error ? j.error.message : "login failed", true); return; }
        token = j.data.token;
        sessionStorage.setItem("mw_token", token);
        msg("welcome " + j.data.user.login);
        boot();
      });
  });
  document.getElementById("token").addEventListener("change", function (e) {
    token = e.target.value.trim();
    sessionStorage.setItem("mw_token", token);
    boot();
  });

  boot();
})();
</script>
</body>
</html>
`

const studio: TypedModule = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: { tags: ['studio'], summary: 'Moonql Studio — metadata-driven admin (single HTML page)' },
    },
    async (_request, reply) => reply.type('text/html; charset=utf-8').send(STUDIO_HTML),
  )
}

export default studio
