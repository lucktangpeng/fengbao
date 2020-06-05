// TODO: Implement module
const { src, dest, series, parallel } = require("gulp");
const del = require("del");
const browser = require("browser-sync");
const bs = browser.create();

const loadPluguns = require("gulp-load-plugins");
const Plugins = loadPluguns();

const cwd = process.cwd();

const loadData = require(`${cwd}/pages.config.js`);

console.log(process.cwd);

const style = () => {
  return (
    src("src/assets/styles/*.scss", { base: "src" })
      .pipe(Plugins.sass())
      .pipe(Plugins.cleanCss())
      // .pipe(Plugins.rename())
      .pipe(dest("dist"))
  );
};

const script = () => {
  return src("src/assets/scripts/*.js", { base: "src" })
    .pipe(Plugins.babel({ presets: [require("@babel/preset-env")] }))
    .pipe(Plugins.uglify())
    .pipe(dest("dist"));
};

const page = () => {
  return src("src/*.html", { base: "src" })
    .pipe(Plugins.swig({ data: loadData.data }))
    .pipe(dest("dist"));
};

const image = () => {
  return src("src/assets/images/**", { base: "src" })
    .pipe(Plugins.imagemin())
    .pipe(dest("dist"));
};

const font = () => {
  return src("src/assets/fonts/**", { base: "src" })
    .pipe(Plugins.imagemin())
    .pipe(dest("dist"));
};

const other = () => {
  return src("public", { base: "public" }).pipe(dest("dist"));
};

const clean = () => {
  return del(["dist"]);
};

const serve = () => {
  bs.init({
    port: 4008,
    files: "dist/**",
    server: {
      baseDir: ["dist", "src"],
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

const useref = () => {
  return src("dist/*.html", { base: "dist" })
    .pipe(Plugins.useref({ searchPath: ["dist", "."] }))
    .pipe(Plugins.if(/\.js$/, Plugins.uglify()))
    .pipe(Plugins.if(/\.css$/, Plugins.cleanCss()))
    .pipe(
      Plugins.if(
        /\.html$/,
        Plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        })
      )
    )
    .pipe(dest("dist"));
};

const start = parallel(style, script, page);

const build = series(clean, parallel(start, image, font, other), useref);

const dev = series(clean, start, serve);

module.exports = {
  dev,
  build,
  clean,
};
