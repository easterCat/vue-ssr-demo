const Vue = require("vue");
const server = require("express")();
// 创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer({
  template: require("fs").readFileSync("./index.template.html", "utf-8")
});

server.get("*", (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>Hello World</div>`
  });

  const context = {
    title: "template insert",
    meta: `
    <meta name="keywords" content="HTML,ASP,PHP,SQL">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    `,
    inner: "<p>日照香炉生紫烟</p>",
    color: "<p style='color:red;background:blue'>遥看瀑布挂前川</p>"
  };

  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      res.status(500).end("Internal Server Error");
      return;
    }

    console.log(html);

    res.end(html);
  });
});

server.listen(3333);

// renderer
//   .renderToString(app)
//   .then(html => {
//     console.log(html);
//   })
//   .catch(err => {
//     console.error(err);
//   });
