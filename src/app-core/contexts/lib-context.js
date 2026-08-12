// Info: React bridge for the Lib container. Builds Lib once per provider mount
// (memoized on the adapters reference) and exposes it through context so any
// screen/component can call useLib() to reach the SDK, helper modules
// (Utils/Debug), the theme engine, etc. Memoization lives here, not in the
// loader, so each provider mount gets a fresh container.
'use strict';

const React = require('react');
const loader = require('../loader');

const LibCtx = React.createContext(null);


// Provider: build Lib (memoized on adapters) and supply it to the tree
function LibProvider (props) {
  const Lib = React.useMemo(function () {
    return loader(props.adapters).Lib;
  }, [props.adapters]);

  return React.createElement(LibCtx.Provider, { value: Lib }, props.children);
}


// Hook: read the Lib container
function useLib () {
  return React.useContext(LibCtx);
}


module.exports = { LibProvider: LibProvider, useLib: useLib, LibCtx: LibCtx };
