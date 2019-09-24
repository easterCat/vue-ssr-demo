const Vue = require("vue");
const server = require("express")();
// 创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();

server.get("*", (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>Hello World</div>`
  });

  // 将 Vue 实例渲染为 HTML
  renderer.renderToString(app, (err, html) => {
    if (err) {
      res.status(500).end("Internal Server Error");
      return;
    }

    res.end(`
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Hello</title></head>
        <body>
        <div>today is a good day</div>
        <div>${html}</div>
        </body>
      </html>
    `);
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
