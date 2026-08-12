// Info: Expo adapter for the Navigation slot. Maps the navigation contract onto
// expo-router primitives. Shared source never imports expo-router directly.
'use strict';

const { Link, Redirect } = require('expo-router');


module.exports = function (Lib, config) {

  // Ready-to-use navigation surface; the loader assigns it to Lib.Navigation
  return {
    Link: Link,
    Redirect: Redirect
  };

};
