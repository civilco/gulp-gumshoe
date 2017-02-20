# gumshoe
A Gulp plugin to watch your asset sizes.

## Install
`npm install gulp-gumshoe --save-dev`

In your Gulpfile:
```javascript
const gumshoe = require('gulp-gumshoe');
gulp.task('deploy-assets', () => {
  return gulp.src('./dist/**/*')
  .pipe(gumshoe({ apiKey: 'abc123' }));
});
```

## Asset fingerprinting (hashing)
If you append a fingerprint/hash to your assets, you can tell
Gumshoe it ignore it when compairing files. It takes a Regex
that will get removed from the file name. For example if your
fingerprint is 10 characters, starting with a `-`, you can use
`/-\w{10,10}$/i`. So a file like: `filename-be17123604.js` will
be reported as `filename.js`.

```javascript
gumshoe({ apiKey: 'abc123', fingerprint: /-\w{10,10}$/i })
```
