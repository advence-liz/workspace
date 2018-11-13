var template = require("./TemplateEngine");
//window.template = template;
let options = { liz: 'liz', version: '1.0.0', on: true }
//条件必须写在 一个 分割符内  而且还得用this
let html = `<%if(this.on)%>
   <%{ %>
<li> </li>
<% this.liz %>
<%} %>`;
console.log(template(html, options));

//test gitattributes
let complie = template(html);
console.log(complie(options));