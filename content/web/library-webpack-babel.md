---
title: Building a libary with Webpack & Babel
date: 2018-04-07
tags: [webpack, babel]
excerpt: I just got done building my first open source library, and to my surprise it took me awhile to figure out all the ins and outs of building it with webpack and babel.
---

I just got done building my first [open source library](https://github.com/nmackey/accessible-nprogress), and to my surprise it took me awhile to figure out all the ins and outs of building it with [webpack](https://webpack.js.org/) and [babel](https://babeljs.io/).  As someone who builds single page apps for a living and is very familiar with webpack, babel, and their related tools this was somewhat frustrating.  I thought I would share my experience here so others could learn from my pain.

---

### 1. So you want to create a library?

At work we are redesigning a good chuck of our main web application.  As part of that effort a co-worker and I pushed to update our page loading indicator.  We had both used and liked the progressbar/spinner library [nprogress](https://github.com/rstacruz/nprogress) (It is an easy to use loading indicator that is easy to customize).  So we asked our design team if we could include it in our new design and they approved.

I found out while doing our accessibility testing that this library has some accessibility breaks.  As accessibility has been a big focus at our company over the last year I wasn't pleased with this.  Also I didn't want to go back to our old loading indicator or go back to the design team with another solution.  So I did what any good front-end developer would do:

- I went to the github issues page for the library to see if anyone else had submitted this request...

- Having found an issue about accessibility I was initially relieved...

- Realizing that the issue was almost a year old and no changes except readme updates had been made in the last couple years I was less excited...

- So I forked the repo and made a commit to fix the accessibility changes

- Updated our application at work to point to the commit I had made in my forked version of the library

This initially got me past my problem of breaking the accessibility of our application.  However I didn't like the prospect of having our production application pointing to a commit in my personal repo.  I wasn't planning on deleting the repo or something but it didn't feel right having our app reliant on my personal github repo.  So I decided this would be the perfect opprotunity for me to create my own open source library and publish it to [NPM](https://www.npmjs.com/).

### 2. Webpack & Babel Part 1 - tooling & build setup.

So the inital configuration for webpack & babel is pretty 'easy' to setup.  I have setup it up so many times over the past couple years that I have the hang of it, but when you really think about all you have to do it is pretty crazy.  For beginners it is a pretty daunting task; you need to setup a '.babelrc' file, a webpack config file, add all of the these libraries to your 'package.json'.  I have provided examples of these files below...

```
package.json

{
    "name": "accessible-nprogress",
    "author": "Nicholas Mackey <nicholasmackey@gmail.com>",
    "description": "Simple slim accessible progress bars",
    "main": "dist/accessible-nprogress.js",
    "style": "dist/accessible-nprogress.css",
    "types": "typings/index.d.ts",
    "license": "MIT",
    "version": "2.0.0",
    "repository": "nmackey/accessible-nprogress",
    "scripts": {
        "pretest": "yarn lint",
        "lint": "eslint --ext .js --quiet src",
        "test": "yarn test:unit --coverage && yarn build && yarn build:min && yarn test:acceptance",
        "test:unit": "jest --config config/jest.config.js",
        "test:acceptance": "testcafe chrome:headless test-acceptance/tests/**/*test* -S -s test-acceptance/screenshots",
        "build": "NODE_ENV=development webpack --config config/webpack.config.js",
        "build:min": "NODE_ENV=production webpack --config config/webpack.config.js"
    },
    "dependencies": {},
    "devDependencies": {
        "axe-testcafe": "^1.1.0",
        "babel": "^6.23.0",
        "babel-core": "^6.26.0",
        "babel-preset-env": "^1.6.1",
        "babel-eslint": "^8.2.2",
        "babel-jest": "^22.4.3",
        "babel-loader": "^7.1.4",
        "babel-plugin-transform-es2015-modules-commonjs": "^6.26.0",
        "css-loader": "^0.28.11",
        "eslint": "^4.19.1",
        "eslint-config-airbnb-base": "^12.1.0",
        "eslint-plugin-import": "^2.9.0",
        "eslint-plugin-testcafe": "^0.2.1",
        "extract-text-webpack-plugin": "^3.0.2",
        "jest": "^22.4.3",
        "style-loader": "^0.20.3",
        "testcafe": "^0.19.1",
        "webpack": "^3.10.0"
    },
    "keywords": [
        "progress",
        "progressbar",
        "spinner",
        "accessible",
        "loading",
        "xhr",
        "ajax",
        "promise"
    ]
}
```

```
.babelrc (targeting IE11 & test plugin for Jest)

{
    "presets": [
        [ "env", { "targets": { "ie": 11 } } ]
    ],
    "plugins": [],
    "env": {
        "test": {
            "plugins": [
                "transform-es2015-modules-commonjs"
            ]
        }
    }
}
```

```
webpack.config.js

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const libraryName = 'accessible-nprogress';

const BANNER = `
    ${(new Date()).toString()}
    Accessible NProgress, (c) 2018 Nicholas Mackey - http://nmackey.com/accessible-nprogress
    @license MIT
`;

let outputJs;
let outputCss;
const plugins = [
    new webpack.BannerPlugin(BANNER),
    new webpack.NoEmitOnErrorsPlugin(),
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false,
    }));
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
            drop_console: true,
            unused: true,
        },
        output: {
            ascii_only: true,
        },
        sourceMap: false,
        mangle: true,
    }));
    outputJs = `${libraryName}.min.js`;
    outputCss = `${libraryName}.min.css`;
} else {
    outputJs = `${libraryName}.js`;
    outputCss = `${libraryName}.css`;
}

plugins.push(new ExtractTextPlugin(outputCss));

const config = {
    entry: path.resolve('src/index.js'),
    output: {
        path: path.resolve('dist'),
        filename: outputJs,
    },
    resolve: {
        extensions: ['.js'],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    path.resolve('src'),
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: '.babelcache',
                    },
                },
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                        loader: 'css-loader',
                        options: { minimize: process.env.NODE_ENV === 'production' },
                        },
                    ],
                }),
            },
        ],
    },
    plugins,
};

module.exports = config;
```

Whew...  This is why things like create-react-app are great and other CLI tools and generators exist.  Once you do that once you pretty much never want to do it again and just learn to copy and paste it from your last project.

I also had to setup a bunch of other things like [jest](https://facebook.github.io/jest/) for unit testing, [testcafe](https://devexpress.github.io/testcafe/) (with [axe](https://www.axe-core.org/)) for my accessibility testing, [eslint](https://eslint.org/) for code style & linting, etc.  Setting up these tools can also take a lot of time for the beginner too, but I'm not going to go over that today.

### 3. Writing the code.

This was the easiest part of the whole endevor, but it did take a little bit of work.  Since the library was a couple years old and its build wasn't passing I decided I would keep the same functionality but rewrite it using newer javascript syntax, removing support for old browsers (< IE11), and adding new test frameworks (that ensured ADA compliance).

First I had to understand what the old code was doing, which wasn't too bad.  I then started developing the library using a lot of the same logic but breaking out a public API vs internal functions.  I was able to complete the code & testing pretty quickly and was pretty happy with what I had achieved.  The next part is what really frustrated me.  I had written single page web apps for years but I hadn't tried to pushlish my own library that could be used by others as an imported module or a global by inserting a script tag.

### 4. Webpack & Babel Part 2 - setup for a library

So like I was saying I had a few requirements for what I was trying to accomplish...

- Allow the library to be used by importing it via ES2015 imports

```
import NProgress from 'accessible-nprogress';
```

- Allow the library to be used by importing it via commonjs 'require' syntax

```
const NProgress = require('accessible-nprogress');
```

- Allow the library to be used by importing it via a script tag

```
<script src="https://unpkg.com/accessible-nprogress/dist/accessible-nprogress.min.js"></script>
```

- Transpile and polyfill (without using babel polyfill) so it was friendly to others

I knew I could accomplish the first three items by using something called by [UMD](https://github.com/umdjs/umd) (Universal Module Definition), but I didn't know how to do this in my application with webpack and babel.  First I thought I could just add the code manually which I've seen in other libraries...

```
(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('b'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['b'], function (b) {
            return (root.returnExportsGlobal = factory(b));
        });
    } else {
        // Global Variables
        root.returnExportsGlobal = factory(root.b);
    }
}(this, function (b) {
    // Your actual module
    return {};
}));
```

However when I tried to add some code like this at the top of my module I ran into trouble.  The code I have above works great if you only have one js file and you aren't using a bundler (like webpack) to import other modules into your entry point, but I had broken my code into a couple modules and was trying to have small managable modules for maintainability.

After several some time googling and trying to figure out what I was doing wrong I finally stumbled upon a feature in webpack that makes all of this much easier... There is a [page](https://webpack.js.org/guides/author-libraries/) in the webpack docs where I learned that you can add a few extra options to my webpack.config.js 'output' setup and things would pretty much work how I wanted.

- library: string - library name

- libraryExport: string or string[] (_entry_return_, default, moduleName, [module1, module2]) - how your module exports will be assigned to the library

- libraryTarget: string (var, umd, amd, commonjs, commonjs2, global, window, this) - type of module or variable you want to target

- umdNamedDefine: boolean - if you want your AMD module (as part of the UMD build) named

```
output: {
    library: 'NProgress',
    libraryExport: 'default',
    libraryTarget: 'umd',
    umdNamedDefine: true,
},
```

This would essentially add the snippet of code I showed above to my bundled/transpiled library.  This pretty much got me everything I needed.

Alright so now I had my module all setup for use in apps all over the web except I had to deal with the proper way to polyfill my ES2015+ features that wouldn't get transpiled.  There were two javascript syntax features that I was using in particular that I needed to resolve.  I was using Object.assign() and promise.finally().  I remembered some documentation I had run across a couple years back about how you don't want to use babel-polyfill in a library but only in a web app itself otherwise you will cause issues with global stuff...

```
https://babeljs.io/docs/usage/polyfill/
If you are looking for something that won't modify globals to be used in a tool/library, checkout the transform-runtime plugin.
```

The answer to this problem is to use the [Runtime Transform](https://babeljs.io/docs/plugins/transform-runtime).  You can add a couple of imports to your package.json and add a plugin to your .babelrc file and you should be good to go.

```
package.json
"dependencies": {
    "babel-runtime": "6.26.0",
},
"devDependencies": {
    "babel-plugin-transform-runtime": "6.23.0",
},
```

```
.babelrc
"plugins": ["transform-runtime"]
```

So in full disclosure I ended up deciding against this last step.  I didn't like that this required me to add a dependency to my project.  All of my other dependencies were devDependencies only.  So the route I took was to manually polyfill these two items myself.  It was easy to replace my use of Object.assign() with my own assign() utility function that accomplised the same thing and removing my use of promise.finally() could be accomplished by just using then() & catch().  I made these decisions solely out of the desire to have a dependency free library.

### 5. Publish to NPM

Now that got my code all setup I just need to get it published out to NPM.  This part is pretty straight forward as NPM has made it pretty easy.  First you need to setup an account at NPM.  Second you just need to make sure you have few things inside of your package.json file setup.

- name: library name

- author: your name & info

- main: location of your library for module importing

- license: license type of your library

- version: version of your library

- repository: github repo

- keywords: search terms for people to locate your library

```
package.json

{
    "name": "accessible-nprogress",
    "author": "Nicholas Mackey <nicholasmackey@gmail.com>",
    "description": "Simple slim accessible progress bars",
    "main": "dist/accessible-nprogress.js",
    "license": "MIT",
    "version": "1.0.0",
    "repository": "nmackey/accessible-nprogress",
    "keywords": [
        "progress",
        "progressbar",
        "spinner",
        "accessible",
        "loading",
        "xhr",
        "ajax",
        "promise"
    ]
}
```

Now with all the setup done there is just one last step to publish your library.

```
npm publish
```

Your library has now been published to NPM!

### 6. Wrapup

And that's it... just those few... short... steps and you have create your own open source libary that you can publish to NPM as well :)

To see the final result and all of the other tools and configuration that I use head on over to [accessible-nprogress](https://github.com/nmackey/accessible-nprogress) and check it out!  Better yet - check out the demo [here](https://nmackey.com/accessible-nprogress/) and if you like it add it to your next project.

```
$ npm install --save accessible-nprogress
```
