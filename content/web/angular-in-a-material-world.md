---
title: Angular in a Material World
date: 2015-08-29
tags: [AngularJS, Angular Material]
excerpt: Interested in AngularJS and Material Design? Then you really need to check out Angular Material.
---

Interested in AngularJS and Material Design?  Then you really need to check out [Angular Material](https://material.angularjs.org).  I recently gave a presentation on Angular Material at Omaha's AngularJS meetup [ng-nebraska](https://www.meetup.com/ng-nebraska/).  Read on to see what I thought or check out the presentation [here](https://nmackey.com/presentation-angular-material/).

---

### 1. Material Design

- Unveiled at Google IO 2014

- Google's new design for Android and web applications

- Set of design principles for applications based on physical principles of paper and ink combined with science and technology.

<iframe src="https://www.youtube.com/embed/Q8TXgCzxEnw?rel=0" title="Material Design" allowfullscreen></iframe>

[website](https://www.google.com/design/spec/material-design/introduction.html)

#### Basic principles of Material Design

##### Environment

The material environment is a 3D space, which means all objects have x, y, and z dimensions.

![](/assets/images/environment_1.png)

##### Material Properties

Material has varying x & y dimensions with a uniform thickness (1dp).

![](/assets/images/material_properties_1.png)

![](/assets/images/material_properties_2.png)

##### Elevation & Shadows

Shadows result naturally from the realtive elevation between material elements.

<video autoplay loop muted playsinline>
<source src="https://material-design.storage.googleapis.com/publish/material_v_4/material_ext_publish/0B6Okdz75tqQsM01aOVkzWXFYb1k/inline%20whatismaterial-materialprop-physicalprop-PaperShadow_01_xhdpi_008.webm" type="video/webm">
<source src="https://material-design.storage.googleapis.com/publish/material_v_4/material_ext_publish/0B6Okdz75tqQsSmZ5VlNBRHBXNXM/inline%20whatismaterial-materialprop-physicalprop-PaperShadow_01_xhdpi_008.mp4" type="video/mp4">
</video>

### 2. Angular Material

The Angular Material project is an implementation of Material Design in Angular.js. This project provides a set of reusable, well-tested, and accessible UI components based on the Material Design system.

[website](https://material.angularjs.org)

##### caniuse?

- Browser Support (n-1)

- Angular 1.3.x or higher

- Pre 1.0

- 1.0 targeted for early fall

##### Highlights

- Themes

- Grid (flexbox)

- Input Elements

- Accessibility

- Touch support

##### Where do I start?

- [bower](https://github.com/angular/bower-material)

- [npm](https://www.npmjs.com/package/angular-material)

- [github](https://github.com/angular/material)

##### Review flexbox

Review flexbox b/c angular material's grid system is based on it.

[Nice guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

###### Angular Gulp Generator

Yeoman generator that will bootstrap an app for you with Angular Material.

[generator](https://github.com/Swiip/generator-gulp-angular)

### 3. Examples

We are going to setup angular material app for viewing and submitting talk proposals.

- Generator

- Navigation

- Font Icons

- Lists & Forms

- Themes

- Accessibility

[code on github](https://github.com/nmackey/presentation-angular-material-examples)

### 4. Lessons Learned

##### Good

- Supported by google

- Uses Flexbox

- Pretty

- Provides Material Design for the web

- Not Bootstrap :)

##### Bad

- Not quite ready yet (pre 1.0 & performance issues)

- Still missing a few things...maybe (datepicker just landed)

- Some widgets (directives) don't play well together (toolbar & tabs)

- Missing some documentation (styling, options, services)
