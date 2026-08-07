// Info: React bridge for the Lib container. Builds Lib once (the loader memoizes it)
// and exposes it through context so any screen/component can call useLib() to reach
// the SDK, helper modules (Utils/Debug), the theme engine, etc.
'use strict';

const React = require('react');
const loader = require('../common/loader');

const LibCtx = React.createContext(null);


// Provider: build Lib (memoized across renders) and supply it to the tree
function LibProvider (props) { // eslint-disable-line no-unused-vars
  const Lib = React.useMemo(function () {
    return loader().Lib;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return React.createElement(LibCtx.Provider, { value: Lib }, props.children);
}


// Hook: read the Lib container
function useLib () {
  return React.useContext(LibCtx);
}


module.exports = { LibProvider: LibProvider, useLib: useLib, LibCtx: LibCtx };
