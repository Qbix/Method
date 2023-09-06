# Method
Tiny Javascript library that helps move asynchronous methods into their own files to be loaded on demand

# The Backstory
Over the years, my team and I built large Javascript files, made up of lots of methods, but only a few would be used in any given app or page.

We wanted a reliable way to refactor these files and split some of the methods out into their own files. Since loading another Javascript file may take place asynchronously, the only methods we could really move were asynchronous ones, whether they returned Promises, or were built to take callbacks and call them asynchronously.

But what if the methods referenced closures? We had to have a way to transport the closure variables to the new function in the other file.

# How to use this library

Whenever you have code like this:

```
/**
 * @class SomeObject for example
 */

SomeObject = {

  /**
   * Some documentation
   * @method someMethod
   * @static
   */
  someMethod: function _someMethod (foo, bar, callback) {
     someClosureVariable.a = 5;
  },

  someOtherMethod: function _someOtherMethod (foo, bar, callback) {
     someOtherClosureVariable.b = 5;
  },

  SubObject: {
     anotherMethod: function _anotherMethod () {
        Q.use(someClosureVariable.a);
     }
  }
};
SomeObject.someMethod.options = { ... };
SomeObject.SubObject.anotherMethod.options = { ... };
```

you would refactor it like this:

```
SomeObject = Method.define({

  someMethod: Method.stub,

  someOtherMethod: Method.stub,

  SubObject: Method.define({

     anotherMethod: Method.stub

  }, '/js/methods/SomeObject/SubObject')

}, '/js/methods/SomeObject');

// options will be moved to the individual JS files
```

you would move these methods to a file named MyPlugin/js/methods/SomeObject/someMethod.js like so:

```
export function (someClosureVariable, someOtherClosureVariable) {

  /**
   * @class Users // or whatever your documentation is
   */

  /** 
   * simply copy the whole method and its body here,
   * including its documentation
   * including the closure references
   * @static
   * @method
   */
  return function _someMethod () {
    someClosureVariable.a = 5;
  }l

};
```

Notice that there is even an elegant way to port over the closure variables! However, this only works if the closure variables are basically const which means they never change after they are assigned. That is pretty much the case with nearly all the closure variables in these modules, because they are actually Object which are not reassigned to a different value, but inside, the object's properties can be dynamically changed and that's fine. In other words if you had const Foo = {} you can do Foo.bar = 'baz' with no problem, because the const in Javascript refers to the reference not being reassigned, but the Foo object itself is not "sealed" (which is a different concept in JS).
