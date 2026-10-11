---
title: Angular 1.3
date: 2014-11-15
tags: [AngularJS]
excerpt: With the release of Angular 1.3 the angular team has added a few things that make it more performant, write less code, and help you figure out problems quicker and follow best practices.
---

With the release of Angular 1.3 the angular team has added a few things that make it more performant, write less code, and help you figure out problems quicker and follow best practices.

---

### '::' is for Performance

Angular 1.3 has introduced one-time bindings.  Useing the '::' syntax we can tell angular we only want to bind a value once.

Why is this awesome?

It makes your app faster.

How?

Because watchers slow your app down.

Explain...

When you have too many watchers on your page angular starts to slow down (all the research I've seen says this number is ~2000).  By using one-time binding you remove the watchers for your static content after it is rendered once.  So for example:

`{{title}}`

now can look like:

`{{::title}}`

[one-time binding docs](https://docs.angularjs.org/guide/expression#one-time-binding)

---

### ng-model-options = awesome

Have you ever wanted to debouce an input field or update your model on blur instead of after every change.  I in fact have directives in my code to handle these very things.  With angular 1.3 I can go delete that code and use ng-model-options instead.

You can use ng-model-options anywhere you use ng-model.  The different options include:

- updateOn

- debounce

- allowInvalid

- getterSetter

- timezone

I'm going to walk through the two I'm going to be using right away...debounce and updateOn.

#### debounce

The following code debounces model changes for 1000ms.

```
<input type="text" name="search"
       ng-model="search"
       ng-model-options="{ debounce: 1000 }" />

```

#### update

The following code will only update the model on blur.

```
<input type="text" name="search"
       ng-model="search"
       ng-model-options="{ updateOn: 'blur' }">

```

[ng-model-options docs](https://docs.angularjs.org/api/ng/directive/ngModelOptions)

---

### give me a ng-hint

Angular is working on a new library that can be used with angular 1.3 that helps developers spend less time figuring out what is wrong with their angular code.  Ever forget to inject a dependency that you are using?  Typo in your directive name?  Not sure of what the angular best practices are?  Angular now has your back.

##### Install

`npm install angular-hint`

##### Include

```
<script type="path/to/angular/angular.js"></script>
<script type="path/to/angular-hint/hint.js"></script>

```

##### Use

`<html ng-app="myApp" ng-hint></html>`

Now when you forget to inject a dependency angular will tell you.

When you misspell a directive in you dom angular will recommend the correct one.

Use 'Ctrl' for naming your controllers instead of 'Controller' angular will let you know that it is best practice to use 'Controller'.

[ng-hint on github](https://github.com/angular/angular-hint)
