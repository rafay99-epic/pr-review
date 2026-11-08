import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = Symbol.for("yaml.alias");
    var DOC = Symbol.for("yaml.document");
    var MAP = Symbol.for("yaml.map");
    var PAIR = Symbol.for("yaml.pair");
    var SCALAR = Symbol.for("yaml.scalar");
    var SEQ = Symbol.for("yaml.seq");
    var NODE_TYPE = Symbol.for("yaml.node.type");
    var isAlias = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === ALIAS;
    var isDocument = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === DOC;
    var isMap = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === MAP;
    var isPair = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === PAIR;
    var isScalar = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === SCALAR;
    var isSeq = (node2) => !!node2 && typeof node2 === "object" && node2[NODE_TYPE] === SEQ;
    function isCollection(node2) {
      if (node2 && typeof node2 === "object")
        switch (node2[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode2(node2) {
      if (node2 && typeof node2 === "object")
        switch (node2[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node2) => (isScalar(node2) || isCollection(node2)) && !!node2.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap;
    exports.isNode = isNode2;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove node");
    function visit(node2, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node2)) {
        const cd = visit_(null, node2.contents, visitor_, Object.freeze([node2]));
        if (cd === REMOVE)
          node2.contents = null;
      } else
        visit_(null, node2, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    function visit_(key, node2, visitor, path) {
      const ctrl = callVisitor(key, node2, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node2)) {
          path = Object.freeze(path.concat(node2));
          for (let i = 0; i < node2.items.length; ++i) {
            const ci = visit_(i, node2.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node2.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node2)) {
          path = Object.freeze(path.concat(node2));
          const ck = visit_("key", node2.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node2.key = null;
          const cv = visit_("value", node2.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node2.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node2, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node2)) {
        const cd = await visitAsync_(null, node2.contents, visitor_, Object.freeze([node2]));
        if (cd === REMOVE)
          node2.contents = null;
      } else
        await visitAsync_(null, node2, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node2, visitor, path) {
      const ctrl = await callVisitor(key, node2, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node2)) {
          path = Object.freeze(path.concat(node2));
          for (let i = 0; i < node2.items.length; ++i) {
            const ci = await visitAsync_(i, node2.items[i], visitor, path);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node2.items.splice(i, 1);
              i -= 1;
            }
          }
        } else if (identity.isPair(node2)) {
          path = Object.freeze(path.concat(node2));
          const ck = await visitAsync_("key", node2.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node2.key = null;
          const cv = await visitAsync_("value", node2.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node2.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node2, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node2, path);
      if (identity.isMap(node2))
        return visitor.Map?.(key, node2, path);
      if (identity.isSeq(node2))
        return visitor.Seq?.(key, node2, path);
      if (identity.isPair(node2))
        return visitor.Pair?.(key, node2, path);
      if (identity.isScalar(node2))
        return visitor.Scalar?.(key, node2, path);
      if (identity.isAlias(node2))
        return visitor.Alias?.(key, node2, path);
      return void 0;
    }
    function replaceNode(key, path, node2) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node2;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node2;
        else
          parent.value = node2;
      } else if (identity.isDocument(parent)) {
        parent.contents = node2;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts = line.trim().split(/[ \t]+/);
        const name = parts.shift();
        switch (name) {
          case "%TAG": {
            if (parts.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts.length < 2)
                return false;
            }
            const [handle, prefix] = parts;
            this.tags[handle] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle, suffix2] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix2)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix2);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node2) => {
            if (identity.isNode(node2) && node2.tag)
              tags[node2.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle, prefix] of tagEntries) {
          if (handle === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines.push(`%TAG ${handle} ${prefix}`);
        }
        return lines.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor2) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor2)) {
        const sa = JSON.stringify(anchor2);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node2) {
          if (node2.anchor)
            anchors.add(node2.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i = 1; true; ++i) {
        const name = `${prefix}${i}`;
        if (!exclude.has(name))
          return name;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor2 = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor2);
          return anchor2;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i = 0, len = val.length; i < len; ++i) {
            const v0 = val[i];
            const v1 = applyReviver(reviver, val, String(i), v0);
            if (v1 === void 0)
              delete val[i];
            else if (v1 !== v0)
              val[i] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value2, arg, ctx) {
      if (Array.isArray(value2))
        return value2.map((v, i) => toJS(v, String(i), ctx));
      if (value2 && typeof value2.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value2))
          return value2.toJSON(arg, ctx);
        const data = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value2, data);
        ctx.onCreate = (res2) => {
          data.res = res2;
          delete ctx.onCreate;
        };
        const res = value2.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value2 === "bigint" && !ctx?.keep)
        return Number(value2);
      return value2;
    }
    exports.toJS = toJS;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type2) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type2 });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var Alias2 = class extends Node.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node2) => {
              if (identity.isAlias(node2) || identity.hasAnchor(node2))
                nodes.push(node2);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node2 of nodes) {
          if (node2 === this)
            break;
          if (node2.anchor === this.source)
            found = node2;
        }
        if (found && ctx) {
          const { anchors: anchors2, doc: doc2, maxAliasCount } = ctx;
          let data = anchors2.get(found);
          if (!data) {
            toJS.toJS(found, null, ctx);
            data = anchors2.get(found);
          }
          if (data?.res === void 0) {
            const msg = "This should not happen: Alias anchor was not resolved?";
            throw new ReferenceError(msg);
          }
          if (maxAliasCount >= 0) {
            data.count += 1;
            if (data.aliasCount === 0)
              data.aliasCount = getAliasCount(doc2, found, anchors2);
            if (data.count * data.aliasCount > maxAliasCount) {
              const msg = "Excessive alias count indicates a resource exhaustion attack";
              throw new ReferenceError(msg);
            }
          }
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node2, anchors2) {
      if (identity.isAlias(node2)) {
        const source = node2.resolve(doc);
        const anchor2 = anchors2 && source && anchors2.get(source);
        return anchor2 ? anchor2.count * anchor2.aliasCount : 0;
      } else if (identity.isCollection(node2)) {
        let count = 0;
        for (const item of node2.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node2)) {
        const kc = getAliasCount(doc, node2.key, anchors2);
        const vc = getAliasCount(doc, node2.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value2) => !value2 || typeof value2 !== "function" && typeof value2 !== "object";
    var Scalar = class extends Node.NodeBase {
      constructor(value2) {
        super(identity.SCALAR);
        this.value = value2;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias2 = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value2, tagName, tags) {
      if (tagName) {
        const match2 = tags.filter((t) => t.tag === tagName);
        const tagObj = match2.find((t) => !t.format) ?? match2[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value2) && !t.format);
    }
    function createNode2(value2, tagName, ctx) {
      if (identity.isDocument(value2))
        value2 = value2.contents;
      if (identity.isNode(value2))
        return value2;
      if (identity.isPair(value2)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value2);
        return map;
      }
      if (value2 instanceof String || value2 instanceof Number || value2 instanceof Boolean || typeof BigInt !== "undefined" && value2 instanceof BigInt) {
        value2 = value2.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema: schema2, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value2 && typeof value2 === "object") {
        ref = sourceObjects.get(value2);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value2));
          return new Alias2.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value2, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value2, tagName, schema2.tags);
      if (!tagObj) {
        if (value2 && typeof value2.toJSON === "function") {
          value2 = value2.toJSON();
        }
        if (!value2 || typeof value2 !== "object") {
          const node3 = new Scalar.Scalar(value2);
          if (ref)
            ref.node = node3;
          return node3;
        }
        tagObj = value2 instanceof Map ? schema2[identity.MAP] : Symbol.iterator in Object(value2) ? schema2[identity.SEQ] : schema2[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node2 = tagObj?.createNode ? tagObj.createNode(ctx.schema, value2, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value2, ctx) : new Scalar.Scalar(value2);
      if (tagName)
        node2.tag = tagName;
      else if (!tagObj.default)
        node2.tag = tagObj.tag;
      if (ref)
        ref.node = node2;
      return node2;
    }
    exports.createNode = createNode2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode2 = require_createNode();
    var identity = require_identity();
    var Node = require_Node();
    function collectionFromPath(schema2, path, value2) {
      let v = value2;
      for (let i = path.length - 1; i >= 0; --i) {
        const k = path[i];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode2.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema: schema2,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node.NodeBase {
      constructor(type2, schema2) {
        super(type2);
        Object.defineProperty(this, "schema", {
          value: schema2,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema2) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema2)
          copy.schema = schema2;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema2) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value2) {
        if (isEmptyPath(path))
          this.add(value2);
        else {
          const [key, ...rest] = path;
          const node2 = this.get(key, true);
          if (identity.isCollection(node2))
            node2.addIn(rest, value2);
          else if (node2 === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value2));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node2 = this.get(key, true);
        if (identity.isCollection(node2))
          return node2.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node2 = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node2) ? node2.value : node2;
        else
          return identity.isCollection(node2) ? node2.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node2) => {
          if (!identity.isPair(node2))
            return false;
          const n = node2.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node2 = this.get(key, true);
        return identity.isCollection(node2) ? node2.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value2) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value2);
        } else {
          const node2 = this.get(key, true);
          if (identity.isCollection(node2))
            node2.setIn(rest, value2);
          else if (node2 === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value2));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str2) => str2.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent2) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent2 ? comment.replace(/^(?! *$)/gm, indent2) : comment;
    }
    var lineComment = (str2, indent2, comment) => str2.endsWith("\n") ? indentComment(comment, indent2) : comment.includes("\n") ? "\n" + indentComment(comment, indent2) : (str2.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent2, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent2.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent2.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i = consumeMoreIndentedLines(text, i, indent2.length);
        if (i !== -1)
          end = i + endStep;
      }
      for (let ch; ch = text[i += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i;
          switch (text[i + 1]) {
            case "x":
              i += 3;
              break;
            case "u":
              i += 5;
              break;
            case "U":
              i += 9;
              break;
            default:
              i += 1;
          }
          escEnd = i;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i = consumeMoreIndentedLines(text, i, indent2.length);
          end = i + indent2.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next2 = text[i + 1];
            if (next2 && next2 !== " " && next2 !== "\n" && next2 !== "	")
              split = i;
          }
          if (i >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i += 1];
                overflow = true;
              }
              const j = i > escEnd + 1 ? i - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i2 = 0; i2 < folds.length; ++i2) {
        const fold = folds[i2];
        const end2 = folds[i2 + 1] || text.length;
        if (fold === 0)
          res = `
${indent2}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent2}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i, indent2) {
      let end = i;
      let start = i + 1;
      let ch = text[start];
      while (ch === " " || ch === "	") {
        if (i < start + indent2) {
          ch = text[++i];
        } else {
          do {
            ch = text[++i];
          } while (ch && ch !== "\n");
          end = i;
          start = i + 1;
          ch = text[start];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str2) => /^(%|---|\.\.\.)/m.test(str2);
    function lineLengthOverLimit(str2, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str2.length;
      if (strLen <= limit)
        return false;
      for (let i = 0, start = 0; i < strLen; ++i) {
        if (str2[i] === "\n") {
          if (i - start > limit)
            return true;
          start = i + 1;
          if (strLen - start <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value2, ctx) {
      const json3 = JSON.stringify(value2);
      if (ctx.options.doubleQuotedAsJSON)
        return json3;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent2 = ctx.indent || (containsDocumentMarker(value2) ? "  " : "");
      let str2 = "";
      let start = 0;
      for (let i = 0, ch = json3[i]; ch; ch = json3[++i]) {
        if (ch === " " && json3[i + 1] === "\\" && json3[i + 2] === "n") {
          str2 += json3.slice(start, i) + "\\ ";
          i += 1;
          start = i;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json3[i + 1]) {
            case "u":
              {
                str2 += json3.slice(start, i);
                const code = json3.substr(i + 2, 4);
                switch (code) {
                  case "0000":
                    str2 += "\\0";
                    break;
                  case "0007":
                    str2 += "\\a";
                    break;
                  case "000b":
                    str2 += "\\v";
                    break;
                  case "001b":
                    str2 += "\\e";
                    break;
                  case "0085":
                    str2 += "\\N";
                    break;
                  case "00a0":
                    str2 += "\\_";
                    break;
                  case "2028":
                    str2 += "\\L";
                    break;
                  case "2029":
                    str2 += "\\P";
                    break;
                  default:
                    if (code.substr(0, 2) === "00")
                      str2 += "\\x" + code.substr(2);
                    else
                      str2 += json3.substr(i, 6);
                }
                i += 5;
                start = i + 1;
              }
              break;
            case "n":
              if (implicitKey || json3[i + 2] === '"' || json3.length < minMultiLineLength) {
                i += 1;
              } else {
                str2 += json3.slice(start, i) + "\n\n";
                while (json3[i + 2] === "\\" && json3[i + 3] === "n" && json3[i + 4] !== '"') {
                  str2 += "\n";
                  i += 2;
                }
                str2 += indent2;
                if (json3[i + 2] === " ")
                  str2 += "\\";
                i += 1;
                start = i + 1;
              }
              break;
            default:
              i += 1;
          }
      }
      str2 = start ? str2 + json3.slice(start) : json3;
      return implicitKey ? str2 : foldFlowLines.foldFlowLines(str2, indent2, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value2, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value2.includes("\n") || /[ \t]\n|\n[ \t]/.test(value2))
        return doubleQuotedString(value2, ctx);
      const indent2 = ctx.indent || (containsDocumentMarker(value2) ? "  " : "");
      const res = "'" + value2.replace(/'/g, "''").replace(/\n+/g, `$&
${indent2}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent2, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value2, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value2.includes('"');
        const hasSingle = value2.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value2, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type: type2, value: value2 }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value2)) {
        return quotedString(value2, ctx);
      }
      const indent2 = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value2) ? "  " : "");
      const literal = blockQuote === "literal" ? true : blockQuote === "folded" || type2 === Scalar.Scalar.BLOCK_FOLDED ? false : type2 === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value2, lineWidth, indent2.length);
      if (!value2)
        return literal ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value2.length; endStart > 0; --endStart) {
        const ch = value2[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value2.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value2 === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value2 = value2.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent2}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value2.length; ++startEnd) {
        const ch = value2[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start = value2.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start) {
        value2 = value2.substring(start.length);
        start = start.replace(/\n+/g, `$&${indent2}`);
      }
      const indentSize = indent2 ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal) {
        const foldedValue = value2.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent2}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type2 !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body = foldFlowLines.foldFlowLines(`${start}${foldedValue}${end}`, indent2, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent2}${body}`;
      }
      value2 = value2.replace(/\n+/g, `$&${indent2}`);
      return `|${header}
${indent2}${start}${value2}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type: type2, value: value2 } = item;
      const { actualString, implicitKey, indent: indent2, indentStep, inFlow } = ctx;
      if (implicitKey && value2.includes("\n") || inFlow && /[[\]{},]/.test(value2)) {
        return quotedString(value2, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value2)) {
        return implicitKey || inFlow || !value2.includes("\n") ? quotedString(value2, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type2 !== Scalar.Scalar.PLAIN && value2.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value2)) {
        if (indent2 === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent2 === indentStep) {
          return quotedString(value2, ctx);
        }
      }
      const str2 = value2.replace(/\n+/g, `$&
${indent2}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str2);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value2, ctx);
      }
      return implicitKey ? str2 : foldFlowLines.foldFlowLines(str2, indent2, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type: type2 } = item;
      if (type2 !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type2 = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type2);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match2 = tags.filter((t) => t.tag === item.tag);
        if (match2.length > 0)
          return match2.find((t) => t.format === item.format) ?? match2[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match2 = tags.filter((t) => t.identify?.(obj));
        if (match2.length > 1) {
          const testMatch = match2.filter((t) => t.test);
          if (testMatch.length > 0)
            match2 = testMatch;
        }
        tagObj = match2.find((t) => t.format === item.format) ?? match2.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name} value`);
      }
      return tagObj;
    }
    function stringifyProps(node2, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor2 = (identity.isScalar(node2) || identity.isCollection(node2)) && node2.anchor;
      if (anchor2 && anchors.anchorIsValid(anchor2)) {
        anchors$1.add(anchor2);
        props.push(`&${anchor2}`);
      }
      const tag = node2.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node2 = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node2));
      const props = stringifyProps(node2, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str2 = typeof tagObj.stringify === "function" ? tagObj.stringify(node2, ctx, onComment, onChompKeep) : identity.isScalar(node2) ? stringifyString.stringifyString(node2, ctx, onComment, onChompKeep) : node2.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str2;
      return identity.isScalar(node2) || str2[0] === "{" || str2[0] === "[" ? `${props} ${str2}` : `${props}
${ctx.indent}${str2}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value: value2 }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent: indent2, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value2 == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent2 + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str2 = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str2.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value2 == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str2 === "" ? "?" : explicitKey ? `? ${str2}` : str2;
        }
      } else if (allNullValues && !simpleKeys || value2 == null && explicitKey) {
        str2 = `? ${str2}`;
        if (keyComment && !keyCommentDone) {
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str2;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
        str2 = `? ${str2}
${indent2}:`;
      } else {
        str2 = `${str2}:`;
        if (keyComment)
          str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value2)) {
        vsb = !!value2.spaceBefore;
        vcb = value2.commentBefore;
        valueComment = value2.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value2 && typeof value2 === "object")
          value2 = doc.createNode(value2);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value2))
        ctx.indentAtStart = str2.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value2) && !value2.flow && !value2.tag && !value2.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value2, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value2)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value2.flow ?? value2.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str2 += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str2 += stringifyComment.lineComment(str2, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str2;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value2) => value2 === MERGE_KEY || typeof value2 === "symbol" && value2.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value2) {
      const source = resolveAliasValue(ctx, value2);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value2) {
      const source = resolveAliasValue(ctx, value2);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value3] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value3);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value3,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value2) {
      return ctx && identity.isAlias(value2) ? value2.resolve(ctx.doc, ctx) : value2;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log2 = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value: value2 }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value2);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value2);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value2, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value2, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node2 of ctx.anchors.keys())
          strCtx.anchors.add(node2.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log2.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode2 = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value2, ctx) {
      const k = createNode2.createNode(key, void 0, ctx);
      const v = createNode2.createNode(value2, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value2 = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value2;
      }
      clone(schema2) {
        let { key, value: value2 } = this;
        if (identity.isNode(key))
          key = key.clone(schema2);
        if (identity.isNode(value2))
          value2 = value2.clone(schema2);
        return new _Pair(key, value2);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent: indent2, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str3 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str3 += stringifyComment.lineComment(str3, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines.push(blockItemPrefix + str3);
      }
      let str2;
      if (lines.length === 0) {
        str2 = flowChars.start + flowChars.end;
      } else {
        str2 = lines[0];
        for (let i = 1; i < lines.length; ++i) {
          const line = lines[i];
          str2 += line ? `
${indent2}${line}` : "\n";
        }
      }
      if (comment) {
        str2 += "\n" + stringifyComment.indentComment(commentString(comment), indent2);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str2;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent: indent2, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines = [];
      for (let i = 0; i < items.length; ++i) {
        const item = items[i];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines.push("");
          addCommentBefore(ctx, lines, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines.push("");
            addCommentBefore(ctx, lines, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str2 = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines.length > linesAtValue || str2.includes("\n"));
        if (i < items.length - 1) {
          str2 += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines.reduce((sum, line) => sum + line.length + 2, 2) + (str2.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str2 += ",";
          }
        }
        if (comment)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment));
        lines.push(str2);
        linesAtValue = lines.length;
      }
      const { start, end } = flowChars;
      if (lines.length === 0) {
        return start + end;
      } else {
        if (!reqNewline) {
          const len = lines.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str2 = start;
          for (const line of lines)
            str2 += line ? `
${indentStep}${indent2}${line}` : "\n";
          return `${str2}
${indent2}${end}`;
        } else {
          return `${start}${fcPadding}${lines.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent: indent2, options: { commentString } }, lines, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent2);
        lines.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema2) {
        super(identity.MAP, schema2);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema2, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema2);
        const add = (key, value2) => {
          if (typeof replacer === "function")
            value2 = replacer.call(obj, key, value2);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value2 !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value2, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value2] of obj)
            add(key, value2);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add(key, obj[key]);
        }
        if (typeof schema2.sortMapEntries === "function") {
          map.items.sort(schema2.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i === -1)
            this.items.push(_pair);
          else
            this.items.splice(i, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node2 = it?.value;
        return (!keepScalar && identity.isScalar(node2) ? node2.value : node2) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value2) {
        this.add(new Pair.Pair(key, value2), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type2) {
        const map = Type2 ? new Type2() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema2, obj, ctx) => YAMLMap.YAMLMap.from(schema2, obj, ctx)
    };
    exports.map = map;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode2 = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema2) {
        super(identity.SEQ, schema2);
        this.items = [];
      }
      add(value2) {
        this.items.push(value2);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value2) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value2))
          prev.value = value2;
        else
          this.items[idx] = value2;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema2, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema2);
        if (obj && Symbol.iterator in Object(obj)) {
          let i = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode2.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema2, obj, ctx) => YAMLSeq.YAMLSeq.from(schema2, obj, ctx)
    };
    exports.seq = seq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string2 = {
      identify: (value2) => typeof value2 === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str2) => str2,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value2) => value2 == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value2) => typeof value2 === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str2) => new Scalar.Scalar(str2[0] === "t" || str2[0] === "T"),
      stringify({ source, value: value2 }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value2 === sv)
            return source;
        }
        return value2 ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value: value2 }) {
      if (typeof value2 === "bigint")
        return String(value2);
      const num2 = typeof value2 === "number" ? value2 : Number(value2);
      if (!isFinite(num2))
        return isNaN(num2) ? ".nan" : num2 < 0 ? "-.inf" : ".inf";
      let n = Object.is(value2, -0) ? "-0" : JSON.stringify(value2);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i = n.indexOf(".");
        if (i < 0) {
          i = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str2) => str2.slice(-3).toLowerCase() === "nan" ? NaN : str2[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str2) => parseFloat(str2),
      stringify(node2) {
        const num2 = Number(node2.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node2);
      }
    };
    var float = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str2) {
        const node2 = new Scalar.Scalar(parseFloat(str2));
        const dot = str2.indexOf(".");
        if (dot !== -1 && str2[str2.length - 1] === "0")
          node2.minFractionDigits = str2.length - dot - 1;
        return node2;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value2) => typeof value2 === "bigint" || Number.isInteger(value2);
    var intResolve = (str2, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str2) : parseInt(str2.substring(offset), radix);
    function intStringify(node2, radix, prefix) {
      const { value: value2 } = node2;
      if (intIdentify(value2) && value2 >= 0)
        return prefix + value2.toString(radix);
      return stringifyNumber.stringifyNumber(node2);
    }
    var intOct = {
      identify: (value2) => intIdentify(value2) && value2 >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 8, opt),
      stringify: (node2) => intStringify(node2, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value2) => intIdentify(value2) && value2 >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 16, opt),
      stringify: (node2) => intStringify(node2, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string2 = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema2 = [
      map.map,
      seq.seq,
      string2.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value2) {
      return typeof value2 === "bigint" || Number.isInteger(value2);
    }
    var stringifyJSON = ({ value: value2 }) => JSON.stringify(value2);
    var jsonScalars = [
      {
        identify: (value2) => typeof value2 === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str2) => str2,
        stringify: stringifyJSON
      },
      {
        identify: (value2) => value2 == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value2) => typeof value2 === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str2) => str2 === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str2, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str2) : parseInt(str2, 10),
        stringify: ({ value: value2 }) => intIdentify(value2) ? value2.toString() : JSON.stringify(value2)
      },
      {
        identify: (value2) => typeof value2 === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str2) => parseFloat(str2),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str2, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str2)}`);
        return str2;
      }
    };
    var schema2 = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary = {
      identify: (value2) => value2 instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str2 = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str2.length);
          for (let i = 0; i < str2.length; ++i)
            buffer[i] = str2.charCodeAt(i);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type: type2, value: value2 }, ctx, onComment, onChompKeep) {
        if (!value2)
          return "";
        const buf = value2;
        let str2;
        if (typeof node_buffer.Buffer === "function") {
          str2 = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i = 0; i < buf.length; ++i)
            s += String.fromCharCode(buf[i]);
          str2 = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type2 ?? (type2 = Scalar.Scalar.BLOCK_LITERAL);
        if (type2 !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str2.length / lineWidth);
          const lines = new Array(n);
          for (let i = 0, o = 0; i < n; ++i, o += lineWidth) {
            lines[i] = str2.substr(o, lineWidth);
          }
          str2 = lines.join(type2 === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type: type2, value: str2 }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i = 0; i < seq.items.length; ++i) {
          let item = seq.items[i];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema2, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema2);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i++), it);
          let key, value2;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value2 = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value2 = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value2, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value2;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value2 = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value2);
        }
        return map;
      }
      static from(schema2, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema2, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value2) => value2 instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema2, iterable, ctx) => YAMLOMap.from(schema2, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value: value2, source }, ctx) {
      const boolObj = value2 ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value2 ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value2) => value2 === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value2) => value2 === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str2) => str2.slice(-3).toLowerCase() === "nan" ? NaN : str2[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str2) => parseFloat(str2.replace(/_/g, "")),
      stringify(node2) {
        const num2 = Number(node2.value);
        return isFinite(num2) ? num2.toExponential() : stringifyNumber.stringifyNumber(node2);
      }
    };
    var float = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str2) {
        const node2 = new Scalar.Scalar(parseFloat(str2.replace(/_/g, "")));
        const dot = str2.indexOf(".");
        if (dot !== -1) {
          const f = str2.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node2.minFractionDigits = f.length;
        }
        return node2;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value2) => typeof value2 === "bigint" || Number.isInteger(value2);
    function intResolve(str2, offset, radix, { intAsBigInt }) {
      const sign = str2[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str2 = str2.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str2 = `0b${str2}`;
            break;
          case 8:
            str2 = `0o${str2}`;
            break;
          case 16:
            str2 = `0x${str2}`;
            break;
        }
        const n2 = BigInt(str2);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str2, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node2, radix, prefix) {
      const { value: value2 } = node2;
      if (intIdentify(value2)) {
        const str2 = value2.toString(radix);
        return value2 < 0 ? "-" + prefix + str2.substr(1) : prefix + str2;
      }
      return stringifyNumber.stringifyNumber(node2);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 2, opt),
      stringify: (node2) => intStringify(node2, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 1, 8, opt),
      stringify: (node2) => intStringify(node2, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str2, _onError, opt) => intResolve(str2, 2, 16, opt),
      stringify: (node2) => intStringify(node2, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema2) {
        super(schema2);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value2) {
        if (typeof value2 !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value2}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value2) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value2) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema2, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema2);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value2 of iterable) {
            if (typeof replacer === "function")
              value2 = replacer.call(iterable, value2, value2);
            set2.items.push(Pair.createPair(value2, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value2) => value2 instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema2, iterable, ctx) => YAMLSet.from(schema2, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str2, asBigInt) {
      const sign = str2[0];
      const parts = sign === "-" || sign === "+" ? str2.substring(1) : str2;
      const num2 = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num2(60) + num2(p), num2(0));
      return sign === "-" ? num2(-1) * res : res;
    }
    function stringifySexagesimal(node2) {
      let { value: value2 } = node2;
      let num2 = (n) => n;
      if (typeof value2 === "bigint")
        num2 = (n) => BigInt(n);
      else if (isNaN(value2) || !isFinite(value2))
        return stringifyNumber.stringifyNumber(node2);
      let sign = "";
      if (value2 < 0) {
        sign = "-";
        value2 *= num2(-1);
      }
      const _60 = num2(60);
      const parts = [value2 % _60];
      if (value2 < 60) {
        parts.unshift(0);
      } else {
        value2 = (value2 - parts[0]) / _60;
        parts.unshift(value2 % _60);
        if (value2 >= 60) {
          value2 = (value2 - parts[0]) / _60;
          parts.unshift(value2);
        }
      }
      return sign + parts.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value2) => typeof value2 === "bigint" || Number.isInteger(value2),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str2, _onError, { intAsBigInt }) => parseSexagesimal(str2, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value2) => typeof value2 === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str2) => parseSexagesimal(str2, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value2) => value2 instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str2) {
        const match2 = str2.match(timestamp.test);
        if (!match2)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match2.map(Number);
        const millisec = match2[7] ? Number((match2[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match2[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value: value2 }) => value2?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string2 = require_string();
    var binary = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema2 = [
      map.map,
      seq.seq,
      string2.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema2;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string2 = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema2 = require_schema();
    var schema$1 = require_schema2();
    var binary = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema2.schema],
      ["failsafe", [map.map, seq.seq, string2.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string2 = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema: schema2, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema2 === "string" && schema2 || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string2.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines.length !== 1)
          lines.unshift("");
        const cs = commentString(doc.commentBefore);
        lines.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body += stringifyComment.lineComment(body, "", commentString(contentComment));
        if ((body[0] === "|" || body[0] === ">") && lines[lines.length - 1] === "---") {
          lines[lines.length - 1] = `--- ${body}`;
        } else
          lines.push(body);
      } else {
        lines.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines.push("...");
            lines.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines.push(`... ${cs}`);
          }
        } else {
          lines.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines[lines.length - 1] !== "")
            lines.push("");
          lines.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias2 = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode2 = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value2, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value2 === void 0 ? null : this.createNode(value2, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value2) {
        if (assertCollection(this.contents))
          this.contents.add(value2);
      }
      /** Adds a value to the document. */
      addIn(path, value2) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value2);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node2, name) {
        if (!node2.anchor) {
          const prev = anchors.anchorNames(this);
          node2.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name || prev.has(name) ? anchors.findNewAnchor(name || "a", prev) : name;
        }
        return new Alias2.Alias(node2.anchor);
      }
      createNode(value2, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value2 = replacer.call({ "": value2 }, "", value2);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node2 = createNode2.createNode(value2, tag, ctx);
        if (flow && identity.isCollection(node2))
          node2.flow = true;
        setAnchors();
        return node2;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value2, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value2, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value2) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value2);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value2);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value2) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value2;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value2);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value2);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json: json3, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json3,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name, pos, code, message) {
        super();
        this.name = name;
        this.code = code;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLParseError", pos, code, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code, message) {
        super("YAMLWarning", pos, code, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next: next2, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor2 = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next2?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor2 || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor2)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor2 = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start ?? (start = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor2 || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next2 && next2.type !== "space" && next2.type !== "newline" && next2.type !== "comma" && (next2.type !== "scalar" || next2.source !== "")) {
        onError(next2.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next2?.type === "block-map" || next2?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor: anchor2,
        tag,
        newlineAfterProp,
        end,
        start: start ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent2, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent2 && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start, key, sep: sep2, value: value2 } = collItem;
        const keyProps = resolveProps.resolveProps(start, {
          indicator: "explicit-key-ind",
          next: key ?? sep2?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep2) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start[start.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep2 ?? [], {
          indicator: "map-value-ind",
          next: value2,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value2?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value2 ? composeNode(ctx, value2, valueProps, onError) : composeEmptyNode(ctx, offset, sep2, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value2, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start, value: value2 } of bs.items) {
        const props = resolveProps.resolveProps(start, {
          indicator: "seq-item-ind",
          next: value2,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value2) {
            if (value2?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node2 = value2 ? composeNode(ctx, value2, props, onError) : composeEmptyNode(ctx, props.end, start, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value2, onError);
        offset = node2.range[2];
        seq.items.push(node2);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep2 = "";
        for (const token of end) {
          const { source, type: type2 } = token;
          switch (type2) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep2 + cb;
              sep2 = "";
              break;
            }
            case "newline":
              if (comment)
                sep2 += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type2} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i = 0; i < fc.items.length; ++i) {
        const collItem = fc.items[i];
        const { start, key, sep: sep2, value: value2 } = collItem;
        const props = resolveProps.resolveProps(start, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep2?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep2 && !value2) {
            if (i === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep2 && !props.found) {
          const valueNode = value2 ? composeNode(ctx, value2, props, onError) : composeEmptyNode(ctx, props.end, sep2, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value2))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep2 ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value2,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep2)
                for (const st of sep2) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value2) {
            if ("source" in value2 && value2.source?.[0] === ":")
              onError(value2, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value2 ? composeNode(ctx, value2, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep2, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value2))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name} must end with a ${expectedEnd}` : `${name} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor: anchor2, newlineAfterProp: nl } = props;
        const lastProp = anchor2 && tagToken ? anchor2.offset > tagToken.offset ? anchor2 : tagToken : anchor2 ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node2 = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node2.range = coll.range;
      node2.tag = tagName;
      if (tag?.format)
        node2.format = tag.format;
      return node2;
    }
    exports.composeCollection = composeCollection;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start, start, start] };
      const type2 = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines.length;
      for (let i = lines.length - 1; i >= 0; --i) {
        const content = lines[i][1];
        if (content === "" || content === "\r")
          chompStart = i;
        else
          break;
      }
      if (chompStart === 0) {
        const value3 = header.chomp === "+" && lines.length > 0 ? "\n".repeat(Math.max(1, lines.length - 1)) : "";
        let end2 = start + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value3, type: type2, comment: header.comment, range: [start, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i = 0; i < chompStart; ++i) {
        const [indent2, content] = lines[i];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent2.length > trimIndent)
            trimIndent = indent2.length;
        } else {
          if (indent2.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent2.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent2.length;
          contentStart = i;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent2.length + content.length + 1;
      }
      for (let i = lines.length - 1; i >= chompStart; --i) {
        if (lines[i][0].length > trimIndent)
          chompStart = i + 1;
      }
      let value2 = "";
      let sep2 = "";
      let prevMoreIndented = false;
      for (let i = 0; i < contentStart; ++i)
        value2 += lines[i][0].slice(trimIndent) + "\n";
      for (let i = contentStart; i < chompStart; ++i) {
        let [indent2, content] = lines[i];
        offset += indent2.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent2.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent2 = "";
        }
        if (type2 === Scalar.Scalar.BLOCK_LITERAL) {
          value2 += sep2 + indent2.slice(trimIndent) + content;
          sep2 = "\n";
        } else if (indent2.length > trimIndent || content[0] === "	") {
          if (sep2 === " ")
            sep2 = "\n";
          else if (!prevMoreIndented && sep2 === "\n")
            sep2 = "\n\n";
          value2 += sep2 + indent2.slice(trimIndent) + content;
          sep2 = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep2 === "\n")
            value2 += "\n";
          else
            sep2 = "\n";
        } else {
          value2 += sep2 + content;
          sep2 = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i = chompStart; i < lines.length; ++i)
            value2 += "\n" + lines[i][0].slice(trimIndent);
          if (value2[value2.length - 1] !== "\n")
            value2 += "\n";
          break;
        default:
          value2 += "\n";
      }
      const end = start + header.length + scalar.source.length;
      return { value: value2, type: type2, comment: header.comment, range: [start, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent2 = 0;
      let chomp = "";
      let error = -1;
      for (let i = 1; i < source.length; ++i) {
        const ch = source[i];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent2 && n)
            indent2 = n;
          else if (error === -1)
            error = offset + i;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i = 1; i < props.length; ++i) {
        const token = props[i];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent: indent2, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines = [line0];
      for (let i = 1; i < split.length; i += 2)
        lines.push([split[i], split[i + 1]]);
      return lines;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type: type2, source, end } = scalar;
      let _type;
      let value2;
      const _onError = (rel, code, msg) => onError(offset + rel, code, msg);
      switch (type2) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value2 = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value2 = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value2 = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type2}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value: value2,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return unfoldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function unfoldLines(source) {
      const line = /(.*?)\r?\n/sy;
      let match2 = line.exec(source);
      if (!match2)
        return source;
      let trimEnd, trimBoth;
      try {
        trimEnd = new RegExp("(?<![ 	])[ 	]+$");
        trimBoth = new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
      } catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
      }
      let res = match2[1].replace(trimEnd, "");
      let sep2 = " ";
      let pos = line.lastIndex;
      while (match2 = line.exec(source)) {
        const lm = match2[1].replace(trimBoth, "");
        if (lm === "") {
          if (sep2 === "\n")
            res += sep2;
          else
            sep2 = "\n";
        } else {
          res += sep2 + lm;
          sep2 = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match2 = last.exec(source);
      return res + sep2 + (match2?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i = 1; i < source.length - 1; ++i) {
        const ch = source[i];
        if (ch === "\r" && source[i + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i);
          res += fold;
          i = offset;
        } else if (ch === "\\") {
          let next2 = source[++i];
          const cc = escapeCodes[next2];
          if (cc)
            res += cc;
          else if (next2 === "\n") {
            next2 = source[i + 1];
            while (next2 === " " || next2 === "	")
              next2 = source[++i + 1];
          } else if (next2 === "\r" && source[i + 1] === "\n") {
            next2 = source[++i + 1];
            while (next2 === " " || next2 === "	")
              next2 = source[++i + 1];
          } else if (next2 === "x" || next2 === "u" || next2 === "U") {
            const length = next2 === "x" ? 2 : next2 === "u" ? 4 : 8;
            res += parseCharCode(source, i + 1, length, onError);
            i += length;
          } else {
            const raw = source.substr(i - 1, 2);
            onError(i - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
            res += raw;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i;
          let next2 = source[i + 1];
          while (next2 === " " || next2 === "	")
            next2 = source[++i + 1];
          if (next2 !== "\n" && !(next2 === "\r" && source[i + 2] === "\n"))
            res += i > wsStart ? source.slice(wsStart, i + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code);
      } catch {
        const raw = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw}`);
        return raw;
      }
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value: value2, type: type2, comment, range: range2 } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value2, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value2, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value2, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value2);
      }
      scalar.range = range2;
      scalar.source = value2;
      if (type2)
        scalar.type = type2;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema2, value2, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema2[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema2.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value2))
          return tag;
      const kt = schema2.knownTags[tagName];
      if (kt && !kt.collection) {
        schema2.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema2[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema: schema2 }, value2, token, onError) {
      const tag = schema2.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value2)) || schema2[identity.SCALAR];
      if (schema2.compat) {
        const compat = schema2.compat.find((tag2) => tag2.default && tag2.test?.test(value2)) ?? schema2[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i = pos - 1; i >= 0; --i) {
          let st = before[i];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias2 = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor: anchor2, tag } = props;
      let node2;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node2 = composeAlias(ctx, token, onError);
          if (anchor2 || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node2 = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor2)
            node2.anchor = anchor2.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node2 = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor2)
              node2.anchor = anchor2.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node2 ?? (node2 = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor2 && node2.anchor === "")
        onError(anchor2, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node2) || typeof node2.value !== "string" || node2.tag && node2.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node2.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node2.comment = comment;
        else
          node2.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node2.srcToken = token;
      return node2;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor: anchor2, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node2 = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor2) {
        node2.anchor = anchor2.source.substring(1);
        if (node2.anchor === "")
          onError(anchor2, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node2.spaceBefore = true;
      if (comment) {
        node2.comment = comment;
        node2.range[2] = end;
      }
      return node2;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias = new Alias2.Alias(source.substring(1));
      if (alias.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias.comment = re.comment;
      return alias;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start, value: value2, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start, {
        indicator: "doc-start",
        next: value2 ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value2 && (value2.type === "block-map" || value2.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value2 ? composeNode.composeNode(ctx, value2, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i = 0; i < prelude.length; ++i) {
        const source = prelude[i];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i + 1]?.[0] !== "#")
              i += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i = 0; i < this.errors.length; ++i)
            doc.errors.push(this.errors[i]);
          for (let i = 0; i < this.warnings.length; ++i)
            doc.warnings.push(this.warnings[i]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value2, context) {
      const { implicitKey = false, indent: indent2, inFlow = false, offset = -1, type: type2 = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type: type2, value: value2 }, {
        implicitKey,
        indent: indent2 > 0 ? " ".repeat(indent2) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent: indent2, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent: indent2, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent: indent2, source: "\n" });
          return { type: "block-scalar", offset, indent: indent2, props, source: body };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent: indent2, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent: indent2, source, end };
        default:
          return { type: "scalar", offset, indent: indent2, source, end };
      }
    }
    function setScalarValue(token, value2, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type: type2 } = context;
      let indent2 = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent2 === "number")
        indent2 += 2;
      if (!type2)
        switch (token.type) {
          case "single-quoted-scalar":
            type2 = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type2 = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type2 = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type2 = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type: type2, value: value2 }, {
        implicitKey: implicitKey || indent2 === null,
        indent: indent2 !== null && indent2 > 0 ? " ".repeat(indent2) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body;
      } else {
        const { offset } = token;
        const indent2 = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent: indent2, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent: indent2, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent: indent2, props, source: body });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type2) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type2;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type: type2, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type: type2, source, end: [nl] });
          break;
        }
        default: {
          const indent2 = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type: type2, indent: indent2, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start, key, sep: sep2, value: value2 }) {
      let res = "";
      for (const st of start)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep2)
        for (const st of sep2)
          res += st.source;
      if (value2)
        res += stringifyToken(value2);
      return res;
    }
    exports.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = Symbol("break visit");
    var SKIP = Symbol("skip children");
    var REMOVE = Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i = 0; i < token.items.length; ++i) {
            const ci = _visit(Object.freeze(path.concat([[field, i]])), token.items[i], visitor);
            if (typeof ci === "number")
              i = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i, 1);
              i -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports.visit = visit;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next2 = this.next ?? "stream";
        while (next2 && (incomplete || this.hasChars(1)))
          next2 = yield* this.parseNext(next2);
      }
      atLineEnd() {
        let i = this.pos;
        let ch = this.buffer[i];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent2 = 0;
          while (ch === " ")
            ch = this.buffer[++indent2 + offset];
          if (ch === "\r") {
            const next2 = this.buffer[indent2 + offset + 1];
            if (next2 === "\n" || !next2 && !this.atEnd)
              return offset + indent2 + 1;
          }
          return ch === "\n" || indent2 >= this.indentNext || !ch && !this.atEnd ? offset + indent2 : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next2) {
        switch (next2) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent2 = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent2 = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent2 !== -1 && indent2 < this.indentNext && line[0] !== "#" || indent2 === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent2 === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next2 = this.charAt(1);
            if (this.flowKey || isEmpty(next2) || next2 === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i = this.pos;
        while (true) {
          const ch = this.buffer[++i];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent2 = 0;
        let ch;
        loop: for (let i2 = this.pos; ch = this.buffer[i2]; ++i2) {
          switch (ch) {
            case " ":
              indent2 += 1;
              break;
            case "\n":
              nl = i2;
              indent2 = 0;
              break;
            case "\r": {
              const next2 = this.buffer[i2 + 1];
              if (!next2 && !this.atEnd)
                return this.setNext("block-scalar");
              if (next2 === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent2 >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent2;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i = nl + 1;
        ch = this.buffer[i];
        while (ch === " ")
          ch = this.buffer[++i];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i];
          nl = i - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i2 = nl - 1;
            let ch2 = this.buffer[i2];
            if (ch2 === "\r")
              ch2 = this.buffer[--i2];
            const lastChar = i2;
            while (ch2 === " ")
              ch2 = this.buffer[--i2];
            if (ch2 === "\n" && i2 >= this.pos && i2 + 1 + indent2 > lastChar)
              nl = i2;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i]) {
          if (ch === ":") {
            const next2 = this.buffer[i + 1];
            if (isEmpty(next2) || inFlow && flowIndicatorChars.has(next2))
              break;
            end = i;
          } else if (isEmpty(ch)) {
            let next2 = this.buffer[i + 1];
            if (ch === "\r") {
              if (next2 === "\n") {
                i += 1;
                ch = "\n";
                next2 = this.buffer[i + 1];
              } else
                end = i;
            }
            if (next2 === "#" || inFlow && flowIndicatorChars.has(next2))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i + 1);
              if (cs === -1)
                break;
              i = Math.max(i, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i, allowEmpty) {
        const s = this.buffer.slice(this.pos, i);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i = this.pos + 2;
          let ch = this.buffer[i];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i];
          return yield* this.pushToIndex(ch === ">" ? i + 1 : i, false);
        } else {
          let i = this.pos + 1;
          let ch = this.buffer[i];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i];
            else if (ch === "%" && hexDigits.has(this.buffer[i + 1]) && hexDigits.has(this.buffer[i + 2])) {
              ch = this.buffer[i += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i;
        }
        return n;
      }
      *pushUntil(test) {
        let i = this.pos;
        let ch = this.buffer[i];
        while (!test(ch))
          ch = this.buffer[++i];
        return yield* this.pushToIndex(i, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start = this.lineStarts[low - 1];
          return { line: low, col: offset - start + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list, type2) {
      for (let i = 0; i < list.length; ++i)
        if (list[i].type === type2)
          return true;
      return false;
    }
    function findNonEmptyIndex(list) {
      for (let i = 0; i < list.length; ++i) {
        switch (list[i].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i = prev.length;
      loop: while (--i >= 0) {
        switch (prev[i].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i]?.type === "space") {
      }
      return prev.splice(i, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i = 0; i < source.length; ++i)
          target.push(source[i]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type2 = cst.tokenType(source);
        if (!type2) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type2 === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type2;
          yield* this.step();
          switch (type2) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start = getFirstKeyStartProps(prev);
          let sep2;
          if (scalar.end) {
            sep2 = scalar.end;
            sep2.push(this.sourceToken);
            delete scalar.end;
          } else
            sep2 = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start, key: scalar, sep: sep2 }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i = 0; i < it.sep.length; ++i) {
              const st = it.sep[i];
              switch (st.type) {
                case "newline":
                  nl.push(i);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start.push(this.sourceToken);
                map.items.push({ start, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start2 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start2 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep2 = it.sep;
                  sep2.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key, sep: sep2 }]
                  });
                } else if (start.length > 0) {
                  it.sep = it.sep.concat(start, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start, key: fs, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs);
              } else {
                Object.assign(it, { key: fs, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs, sep: [] });
              else if (it.sep)
                this.stack.push(fs);
              else
                Object.assign(it, { key: fs, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep2 = fc.end.splice(1, fc.end.length);
            sep2.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start, key: fc, sep: sep2 }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type2) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type: type2,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            start.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start, indent2) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent2)
          return false;
        return start.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log2 = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse2(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log2.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value2, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent2 = Math.round(options);
        options = indent2 < 1 ? void 0 : indent2 > 8 ? { indent: 8 } : { indent: indent2 };
      }
      if (value2 === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value2) && !_replacer)
        return value2.toString(options);
      return new Document.Document(value2, _replacer, options).toString(options);
    }
    exports.parse = parse2;
    exports.parseAllDocuments = parseAllDocuments;
    exports.parseDocument = parseDocument;
    exports.stringify = stringify;
  }
});

// node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias2 = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias2.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// src/index.ts
import { readFile as readFile2 } from "node:fs/promises";

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/arrays.js
var liftArray = (data) => Array.isArray(data) ? data : [data];
var spliterate = (arr, predicate) => {
  const result = [[], []];
  for (const item of arr) {
    if (predicate(item))
      result[0].push(item);
    else
      result[1].push(item);
  }
  return result;
};
var ReadonlyArray = Array;
var includes = (array, element) => array.includes(element);
var range = (length, offset = 0) => [...new Array(length)].map((_, i) => i + offset);
var append = (to, value2, opts) => {
  if (to === void 0) {
    return value2 === void 0 ? [] : Array.isArray(value2) ? value2 : [value2];
  }
  if (opts?.prepend) {
    if (Array.isArray(value2))
      to.unshift(...value2);
    else
      to.unshift(value2);
  } else {
    if (Array.isArray(value2))
      to.push(...value2);
    else
      to.push(value2);
  }
  return to;
};
var conflatenate = (to, elementOrList) => {
  if (elementOrList === void 0 || elementOrList === null)
    return to ?? [];
  if (to === void 0 || to === null)
    return liftArray(elementOrList);
  return to.concat(elementOrList);
};
var conflatenateAll = (...elementsOrLists) => elementsOrLists.reduce(conflatenate, []);
var appendUnique = (to, value2, opts) => {
  if (to === void 0)
    return Array.isArray(value2) ? value2 : [value2];
  const isEqual = opts?.isEqual ?? ((l, r) => l === r);
  for (const v of liftArray(value2))
    if (!to.some((existing) => isEqual(existing, v)))
      to.push(v);
  return to;
};
var groupBy = (array, discriminant) => array.reduce((result, item) => {
  const key = item[discriminant];
  result[key] = append(result[key], item);
  return result;
}, {});
var arrayEquals = (l, r, opts) => l.length === r.length && l.every(opts?.isEqual ? (lItem, i) => opts.isEqual(lItem, r[i]) : (lItem, i) => lItem === r[i]);

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/domain.js
var hasDomain = (data, kind) => domainOf(data) === kind;
var domainOf = (data) => {
  const builtinType = typeof data;
  return builtinType === "object" ? data === null ? "null" : "object" : builtinType === "function" ? "object" : builtinType;
};
var domainDescriptions = {
  boolean: "boolean",
  null: "null",
  undefined: "undefined",
  bigint: "a bigint",
  number: "a number",
  object: "an object",
  string: "a string",
  symbol: "a symbol"
};
var jsTypeOfDescriptions = {
  ...domainDescriptions,
  function: "a function"
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/errors.js
var InternalArktypeError = class extends Error {
};
var throwInternalError = (message) => throwError(message, InternalArktypeError);
var throwError = (message, ctor = Error) => {
  throw new ctor(message);
};
var ParseError = class extends Error {
  name = "ParseError";
};
var throwParseError = (message) => throwError(message, ParseError);
var noSuggest = (s) => ` ${s}`;
var ZeroWidthSpace = "\u200B";

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/flatMorph.js
var flatMorph = (o, flatMapEntry) => {
  const result = {};
  const inputIsArray = Array.isArray(o);
  let outputShouldBeArray = false;
  for (const [i, entry] of Object.entries(o).entries()) {
    const mapped = inputIsArray ? flatMapEntry(i, entry[1]) : flatMapEntry(...entry, i);
    outputShouldBeArray ||= typeof mapped[0] === "number";
    const flattenedEntries = Array.isArray(mapped[0]) || mapped.length === 0 ? (
      // if we have an empty array (for filtering) or an array with
      // another array as its first element, treat it as a list
      mapped
    ) : [mapped];
    for (const [k, v] of flattenedEntries) {
      if (typeof k === "object")
        result[k.group] = append(result[k.group], v);
      else
        result[k] = v;
    }
  }
  return outputShouldBeArray ? Object.values(result) : result;
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/records.js
var entriesOf = Object.entries;
var keysOf = (o) => Object.keys(o);
var isKeyOf = (k, o) => k in o;
var hasKey = (o, k) => k in o;
var DynamicBase = class {
  constructor(properties) {
    Object.assign(this, properties);
  }
};
var NoopBase = class {
};
var CastableBase = class extends NoopBase {
};
var splitByKeys = (o, leftKeys) => {
  const l = {};
  const r = {};
  let k;
  for (k in o) {
    if (k in leftKeys)
      l[k] = o[k];
    else
      r[k] = o[k];
  }
  return [l, r];
};
var omit = (o, keys) => splitByKeys(o, keys)[1];
var isEmptyObject = (o) => Object.keys(o).length === 0;
var stringAndSymbolicEntriesOf = (o) => [
  ...Object.entries(o),
  ...Object.getOwnPropertySymbols(o).map((k) => [k, o[k]])
];
var defineProperties = (base, merged) => (
  // declared like this to avoid https://github.com/microsoft/TypeScript/issues/55049
  Object.defineProperties(base, Object.getOwnPropertyDescriptors(merged))
);
var withAlphabetizedKeys = (o) => {
  const keys = Object.keys(o).sort();
  const result = {};
  for (let i = 0; i < keys.length; i++)
    result[keys[i]] = o[keys[i]];
  return result;
};
var unset = noSuggest(`unset${ZeroWidthSpace}`);
var enumValues = (tsEnum) => Object.values(tsEnum).filter((v) => {
  if (typeof v === "number")
    return true;
  return typeof tsEnum[v] !== "number";
});

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/objectKinds.js
var ecmascriptConstructors = {
  Array,
  Boolean,
  Date,
  Error,
  Function,
  Map,
  Number,
  Promise,
  RegExp,
  Set,
  String,
  WeakMap,
  WeakSet
};
var FileConstructor = globalThis.File ?? Blob;
var platformConstructors = {
  ArrayBuffer,
  Blob,
  File: FileConstructor,
  FormData,
  Headers,
  Request,
  Response,
  URL
};
var typedArrayConstructors = {
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array
};
var builtinConstructors = {
  ...ecmascriptConstructors,
  ...platformConstructors,
  ...typedArrayConstructors,
  String,
  Number,
  Boolean
};
var objectKindOf = (data) => {
  if (Array.isArray(data))
    return "Array";
  let prototype = Object.getPrototypeOf(data);
  while (prototype?.constructor && (!isKeyOf(prototype.constructor.name, builtinConstructors) || !(data instanceof builtinConstructors[prototype.constructor.name])))
    prototype = Object.getPrototypeOf(prototype);
  const name = prototype?.constructor?.name;
  if (name === void 0 || name === "Object")
    return void 0;
  return name;
};
var objectKindOrDomainOf = (data) => typeof data === "object" && data !== null ? objectKindOf(data) ?? "object" : domainOf(data);
var isArray = Array.isArray;
var ecmascriptDescriptions = {
  Array: "an array",
  Function: "a function",
  Date: "a Date",
  RegExp: "a RegExp",
  Error: "an Error",
  Map: "a Map",
  Set: "a Set",
  String: "a String object",
  Number: "a Number object",
  Boolean: "a Boolean object",
  Promise: "a Promise",
  WeakMap: "a WeakMap",
  WeakSet: "a WeakSet"
};
var platformDescriptions = {
  ArrayBuffer: "an ArrayBuffer instance",
  Blob: "a Blob instance",
  File: "a File instance",
  FormData: "a FormData instance",
  Headers: "a Headers instance",
  Request: "a Request instance",
  Response: "a Response instance",
  URL: "a URL instance"
};
var typedArrayDescriptions = {
  Int8Array: "an Int8Array",
  Uint8Array: "a Uint8Array",
  Uint8ClampedArray: "a Uint8ClampedArray",
  Int16Array: "an Int16Array",
  Uint16Array: "a Uint16Array",
  Int32Array: "an Int32Array",
  Uint32Array: "a Uint32Array",
  Float32Array: "a Float32Array",
  Float64Array: "a Float64Array",
  BigInt64Array: "a BigInt64Array",
  BigUint64Array: "a BigUint64Array"
};
var objectKindDescriptions = {
  ...ecmascriptDescriptions,
  ...platformDescriptions,
  ...typedArrayDescriptions
};
var getBuiltinNameOfConstructor = (ctor) => {
  const constructorName = Object(ctor).name ?? null;
  return constructorName && isKeyOf(constructorName, builtinConstructors) && builtinConstructors[constructorName] === ctor ? constructorName : null;
};
var constructorExtends = (ctor, base) => {
  let current = ctor.prototype;
  while (current !== null) {
    if (current === base.prototype)
      return true;
    current = Object.getPrototypeOf(current);
  }
  return false;
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/clone.js
var deepClone = (input2) => _clone(input2, /* @__PURE__ */ new Map());
var _clone = (input2, seen) => {
  if (typeof input2 !== "object" || input2 === null)
    return input2;
  if (seen?.has(input2))
    return seen.get(input2);
  const builtinConstructorName = getBuiltinNameOfConstructor(input2.constructor);
  if (builtinConstructorName === "Date")
    return new Date(input2.getTime());
  if (builtinConstructorName && builtinConstructorName !== "Array")
    return input2;
  const cloned = Array.isArray(input2) ? input2.slice() : Object.create(Object.getPrototypeOf(input2));
  const propertyDescriptors = Object.getOwnPropertyDescriptors(input2);
  if (seen) {
    seen.set(input2, cloned);
    for (const k in propertyDescriptors) {
      const desc = propertyDescriptors[k];
      if ("get" in desc || "set" in desc)
        continue;
      desc.value = _clone(desc.value, seen);
    }
  }
  Object.defineProperties(cloned, propertyDescriptors);
  return cloned;
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/functions.js
var cached = (thunk) => {
  let result = unset;
  return () => result === unset ? result = thunk() : result;
};
var isThunk = (value2) => typeof value2 === "function" && value2.length === 0;
var DynamicFunction = class extends Function {
  constructor(...args2) {
    const params = args2.slice(0, -1);
    const body = args2[args2.length - 1];
    try {
      super(...params, body);
    } catch (e) {
      return throwInternalError(`Encountered an unexpected error while compiling your definition:
                Message: ${e} 
                Source: (${args2.slice(0, -1)}) => {
                    ${args2[args2.length - 1]}
                }`);
    }
  }
};
var Callable = class {
  constructor(fn2, ...[opts]) {
    return Object.assign(Object.setPrototypeOf(fn2.bind(opts?.bind ?? this), this.constructor.prototype), opts?.attach);
  }
};
var envHasCsp = cached(() => {
  try {
    return new Function("return false")();
  } catch {
    return true;
  }
});

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/generics.js
var brand = noSuggest("brand");
var inferred = noSuggest("arkInferred");

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/hkt.js
var args = noSuggest("args");
var Hkt = class {
  constructor() {
  }
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/isomorphic.js
var fileName = () => {
  try {
    const error = new Error();
    const stackLine = error.stack?.split("\n")[2]?.trim() || "";
    const filePath = stackLine.match(/\(?(.+?)(?::\d+:\d+)?\)?$/)?.[1] || "unknown";
    return filePath.replace(/^file:\/\//, "");
  } catch {
    return "unknown";
  }
};
var env = globalThis.process?.env ?? {};
var isomorphic = {
  fileName,
  env
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/strings.js
var capitalize = (s) => s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
var uncapitalize = (s) => s.length === 0 ? s : s[0].toLowerCase() + s.slice(1);
var anchoredRegex = (regex3) => new RegExp(anchoredSource(regex3), typeof regex3 === "string" ? "" : regex3.flags);
var anchoredSource = (regex3) => {
  const source = typeof regex3 === "string" ? regex3 : regex3.source;
  return `^(?:${source})$`;
};
var RegexPatterns = {
  negativeLookahead: (pattern) => `(?!${pattern})`,
  nonCapturingGroup: (pattern) => `(?:${pattern})`
};
var Backslash = "\\";
var whitespaceChars = {
  " ": 1,
  "\n": 1,
  "	": 1
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/numbers.js
var anchoredNegativeZeroPattern = /^-0\.?0*$/.source;
var positiveIntegerPattern = /[1-9]\d*/.source;
var looseDecimalPattern = /\.\d+/.source;
var strictDecimalPattern = /\.\d*[1-9]/.source;
var createNumberMatcher = (opts) => anchoredRegex(RegexPatterns.negativeLookahead(anchoredNegativeZeroPattern) + RegexPatterns.nonCapturingGroup("-?" + RegexPatterns.nonCapturingGroup(RegexPatterns.nonCapturingGroup("0|" + positiveIntegerPattern) + RegexPatterns.nonCapturingGroup(opts.decimalPattern) + "?") + (opts.allowDecimalOnly ? "|" + opts.decimalPattern + "?" : "")));
var wellFormedNumberMatcher = createNumberMatcher({
  decimalPattern: strictDecimalPattern,
  allowDecimalOnly: false
});
var isWellFormedNumber = wellFormedNumberMatcher.test.bind(wellFormedNumberMatcher);
var numericStringMatcher = createNumberMatcher({
  decimalPattern: looseDecimalPattern,
  allowDecimalOnly: true
});
var isNumericString = numericStringMatcher.test.bind(numericStringMatcher);
var numberLikeMatcher = /^-?\d*\.?\d*$/;
var isNumberLike = (s) => s.length !== 0 && numberLikeMatcher.test(s);
var wellFormedIntegerMatcher = anchoredRegex(RegexPatterns.negativeLookahead("^-0$") + "-?" + RegexPatterns.nonCapturingGroup(RegexPatterns.nonCapturingGroup("0|" + positiveIntegerPattern)));
var isWellFormedInteger = wellFormedIntegerMatcher.test.bind(wellFormedIntegerMatcher);
var integerLikeMatcher = /^-?\d+$/;
var isIntegerLike = integerLikeMatcher.test.bind(integerLikeMatcher);
var numericLiteralDescriptions = {
  number: "a number",
  bigint: "a bigint",
  integer: "an integer"
};
var writeMalformedNumericLiteralMessage = (def, kind) => `'${def}' was parsed as ${numericLiteralDescriptions[kind]} but could not be narrowed to a literal value. Avoid unnecessary leading or trailing zeros and other abnormal notation`;
var isWellFormed = (def, kind) => kind === "number" ? isWellFormedNumber(def) : isWellFormedInteger(def);
var parseKind = (def, kind) => kind === "number" ? Number(def) : Number.parseInt(def);
var isKindLike = (def, kind) => kind === "number" ? isNumberLike(def) : isIntegerLike(def);
var tryParseNumber = (token, options) => parseNumeric(token, "number", options);
var tryParseWellFormedNumber = (token, options) => parseNumeric(token, "number", { ...options, strict: true });
var tryParseInteger = (token, options) => parseNumeric(token, "integer", options);
var parseNumeric = (token, kind, options) => {
  const value2 = parseKind(token, kind);
  if (!Number.isNaN(value2)) {
    if (isKindLike(token, kind)) {
      if (options?.strict) {
        return isWellFormed(token, kind) ? value2 : throwParseError(writeMalformedNumericLiteralMessage(token, kind));
      }
      return value2;
    }
  }
  return options?.errorOnFail ? throwParseError(options?.errorOnFail === true ? `Failed to parse ${numericLiteralDescriptions[kind]} from '${token}'` : options?.errorOnFail) : void 0;
};
var tryParseWellFormedBigint = (def) => {
  if (def[def.length - 1] !== "n")
    return;
  const maybeIntegerLiteral = def.slice(0, -1);
  let value2;
  try {
    value2 = BigInt(maybeIntegerLiteral);
  } catch {
    return;
  }
  if (wellFormedIntegerMatcher.test(maybeIntegerLiteral))
    return value2;
  if (integerLikeMatcher.test(maybeIntegerLiteral)) {
    return throwParseError(writeMalformedNumericLiteralMessage(def, "bigint"));
  }
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/registry.js
var arkUtilVersion = "0.56.8";
var initialRegistryContents = {
  version: arkUtilVersion,
  filename: isomorphic.fileName(),
  FileConstructor
};
var registry = initialRegistryContents;
var namesByResolution = /* @__PURE__ */ new Map();
var nameCounts = /* @__PURE__ */ Object.create(null);
var register = (value2) => {
  const existingName = namesByResolution.get(value2);
  if (existingName)
    return existingName;
  let name = baseNameFor(value2);
  if (nameCounts[name])
    name = `${name}${nameCounts[name]++}`;
  else
    nameCounts[name] = 1;
  registry[name] = value2;
  namesByResolution.set(value2, name);
  return name;
};
var isDotAccessible = (keyName) => /^[$A-Z_a-z][\w$]*$/.test(keyName);
var baseNameFor = (value2) => {
  switch (typeof value2) {
    case "object": {
      if (value2 === null)
        break;
      const prefix = objectKindOf(value2) ?? "object";
      return prefix[0].toLowerCase() + prefix.slice(1);
    }
    case "function":
      return isDotAccessible(value2.name) ? value2.name : "fn";
    case "symbol":
      return value2.description && isDotAccessible(value2.description) ? value2.description : "symbol";
  }
  return throwInternalError(`Unexpected attempt to register serializable value of type ${domainOf(value2)}`);
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/primitive.js
var serializePrimitive = (value2) => typeof value2 === "string" ? JSON.stringify(value2) : typeof value2 === "bigint" ? `${value2}n` : `${value2}`;

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/serialize.js
var snapshot = (data, opts = {}) => _serialize(data, {
  onUndefined: `$ark.undefined`,
  onBigInt: (n) => `$ark.bigint-${n}`,
  ...opts
}, []);
var printable = (data, opts) => {
  switch (domainOf(data)) {
    case "object":
      const o = data;
      const ctorName = o.constructor?.name ?? "Object";
      return ctorName === "Object" || ctorName === "Array" ? opts?.quoteKeys === false ? stringifyUnquoted(o, opts?.indent ?? 0, "") : JSON.stringify(_serialize(o, printableOpts, []), null, opts?.indent).replace(quotedBigIntMarker, "$1") : stringifyUnquoted(o, opts?.indent ?? 0, "");
    case "symbol":
      return printableOpts.onSymbol(data);
    default:
      return serializePrimitive(data);
  }
};
var stringifyUnquoted = (value2, indent2, currentIndent) => {
  if (typeof value2 === "function")
    return printableOpts.onFunction(value2);
  if (typeof value2 !== "object" || value2 === null)
    return serializePrimitive(value2);
  const nextIndent = currentIndent + " ".repeat(indent2);
  if (Array.isArray(value2)) {
    if (value2.length === 0)
      return "[]";
    const items = value2.map((item) => stringifyUnquoted(item, indent2, nextIndent)).join(",\n" + nextIndent);
    return indent2 ? `[
${nextIndent}${items}
${currentIndent}]` : `[${items}]`;
  }
  const ctorName = value2.constructor?.name ?? "Object";
  if (ctorName === "Object") {
    const keyValues = stringAndSymbolicEntriesOf(value2).map(([key, val]) => {
      const stringifiedKey = typeof key === "symbol" ? printableOpts.onSymbol(key) : isDotAccessible(key) ? key : JSON.stringify(key);
      const stringifiedValue = stringifyUnquoted(val, indent2, nextIndent);
      return `${nextIndent}${stringifiedKey}: ${stringifiedValue}`;
    });
    if (keyValues.length === 0)
      return "{}";
    return indent2 ? `{
${keyValues.join(",\n")}
${currentIndent}}` : `{${keyValues.join(", ")}}`;
  }
  if (value2 instanceof Date)
    return describeCollapsibleDate(value2);
  if ("expression" in value2 && typeof value2.expression === "string")
    return value2.expression;
  return ctorName;
};
var printableOpts = {
  onCycle: () => "(cycle)",
  onSymbol: (v) => `Symbol(${register(v)})`,
  onFunction: (v) => `Function(${register(v)})`,
  // prefix bigints with a marker so printable can strip the quotes
  // JSON.stringify adds, e.g. [1n] rather than ["1n"]
  onBigInt: (n) => `${bigIntMarker}${n}n`
};
var bigIntMarker = "\uE000";
var quotedBigIntMarker = new RegExp(`"${bigIntMarker}(-?\\d+n)"`, "g");
var _serialize = (data, opts, seen) => {
  switch (domainOf(data)) {
    case "object": {
      const o = data;
      if ("toJSON" in o && typeof o.toJSON === "function")
        return o.toJSON();
      if (typeof o === "function")
        return printableOpts.onFunction(o);
      if (seen.includes(o))
        return "(cycle)";
      const nextSeen = [...seen, o];
      if (Array.isArray(o))
        return o.map((item) => _serialize(item, opts, nextSeen));
      if (o instanceof Date)
        return o.toDateString();
      const result = {};
      for (const k in o)
        result[k] = _serialize(o[k], opts, nextSeen);
      for (const s of Object.getOwnPropertySymbols(o)) {
        result[opts.onSymbol?.(s) ?? s.toString()] = _serialize(o[s], opts, nextSeen);
      }
      return result;
    }
    case "symbol":
      return printableOpts.onSymbol(data);
    case "bigint":
      return opts.onBigInt?.(data) ?? `${data}n`;
    case "undefined":
      return opts.onUndefined ?? "undefined";
    case "string":
      return data.replace(/\\/g, "\\\\");
    default:
      return data;
  }
};
var describeCollapsibleDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const dayOfMonth = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds2 = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  if (month === 0 && dayOfMonth === 1 && hours === 0 && minutes === 0 && seconds2 === 0 && milliseconds === 0)
    return `${year}`;
  const datePortion = `${months[month]} ${dayOfMonth}, ${year}`;
  if (hours === 0 && minutes === 0 && seconds2 === 0 && milliseconds === 0)
    return datePortion;
  const h = hours % 12 || 12;
  const suffix2 = hours < 12 ? " AM" : " PM";
  let timePortion = seconds2 || milliseconds ? `${h}:${pad(minutes, 2)}:${pad(seconds2, 2)}` : `${h}:${pad(minutes, 2)}`;
  if (milliseconds)
    timePortion += `.${pad(milliseconds, 3)}`;
  return `${timePortion + suffix2}, ${datePortion}`;
};
var months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var pad = (value2, length) => String(value2).padStart(length, "0");

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/path.js
var appendStringifiedKey = (path, prop, ...[opts]) => {
  const stringifySymbol = opts?.stringifySymbol ?? printable;
  let propAccessChain = path;
  switch (typeof prop) {
    case "string":
      propAccessChain = isDotAccessible(prop) ? path === "" ? prop : `${path}.${prop}` : `${path}[${JSON.stringify(prop)}]`;
      break;
    case "number":
      propAccessChain = `${path}[${prop}]`;
      break;
    case "symbol":
      propAccessChain = `${path}[${stringifySymbol(prop)}]`;
      break;
    default:
      if (opts?.stringifyNonKey)
        propAccessChain = `${path}[${opts.stringifyNonKey(prop)}]`;
      else {
        throwParseError(`${printable(prop)} must be a PropertyKey or stringifyNonKey must be passed to options`);
      }
  }
  return propAccessChain;
};
var stringifyPath = (path, ...opts) => path.reduce((s, k) => appendStringifiedKey(s, k, ...opts), "");
var ReadonlyPath = class extends ReadonlyArray {
  // alternate strategy for caching since the base object is frozen
  cache = {};
  constructor(...items) {
    super();
    this.push(...items);
  }
  toJSON() {
    if (this.cache.json)
      return this.cache.json;
    this.cache.json = [];
    for (let i = 0; i < this.length; i++) {
      this.cache.json.push(typeof this[i] === "symbol" ? printable(this[i]) : this[i]);
    }
    return this.cache.json;
  }
  stringify() {
    if (this.cache.stringify)
      return this.cache.stringify;
    return this.cache.stringify = stringifyPath(this);
  }
  stringifyAncestors() {
    if (this.cache.stringifyAncestors)
      return this.cache.stringifyAncestors;
    let propString = "";
    const result = [propString];
    for (const path of this) {
      propString = appendStringifiedKey(propString, path);
      result.push(propString);
    }
    return this.cache.stringifyAncestors = result;
  }
};

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/scanner.js
var Scanner = class {
  chars;
  i;
  def;
  constructor(def) {
    this.def = def;
    this.chars = [...def];
    this.i = 0;
  }
  /** Get lookahead and advance scanner by one */
  shift() {
    return this.chars[this.i++] ?? "";
  }
  get lookahead() {
    return this.chars[this.i] ?? "";
  }
  get nextLookahead() {
    return this.chars[this.i + 1] ?? "";
  }
  get length() {
    return this.chars.length;
  }
  shiftUntil(condition) {
    let shifted = "";
    while (this.lookahead) {
      if (condition(this, shifted))
        break;
      else
        shifted += this.shift();
    }
    return shifted;
  }
  shiftUntilEscapable(condition, escapeEscape = "") {
    let shifted = "";
    while (this.lookahead) {
      if (this.lookahead === Backslash) {
        this.shift();
        if (condition(this, shifted))
          shifted += this.shift();
        else if (this.lookahead === Backslash)
          shifted += `${escapeEscape}${this.shift()}`;
        else
          shifted += `${Backslash}${this.shift()}`;
      } else if (condition(this, shifted))
        break;
      else
        shifted += this.shift();
    }
    return shifted;
  }
  shiftUntilLookahead(charOrSet) {
    return typeof charOrSet === "string" ? this.shiftUntil((s) => s.lookahead === charOrSet) : this.shiftUntil((s) => s.lookahead in charOrSet);
  }
  shiftUntilNonWhitespace() {
    return this.shiftUntil(() => !(this.lookahead in whitespaceChars));
  }
  jumpToIndex(i) {
    this.i = i < 0 ? this.length + i : i;
  }
  jumpForward(count) {
    this.i += count;
  }
  get location() {
    return this.i;
  }
  get unscanned() {
    return this.chars.slice(this.i, this.length).join("");
  }
  get scanned() {
    return this.chars.slice(0, this.i).join("");
  }
  sliceChars(start, end) {
    return this.chars.slice(start, end).join("");
  }
  lookaheadIs(char) {
    return this.lookahead === char;
  }
  lookaheadIsIn(tokens) {
    return this.lookahead in tokens;
  }
};
var writeUnmatchedGroupCloseMessage = (char, unscanned) => `Unmatched ${char}${unscanned === "" ? "" : ` before ${unscanned}`}`;
var writeUnclosedGroupMessage = (missingChar) => `Missing ${missingChar}`;

// node_modules/.pnpm/@ark+util@0.56.8/node_modules/@ark/util/out/traits.js
var implementedTraits = noSuggest("implementedTraits");

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/registry.js
var _registryName = "$ark";
var suffix = 2;
while (_registryName in globalThis)
  _registryName = `$ark${suffix++}`;
var registryName = _registryName;
globalThis[registryName] = registry;
var $ark = registry;
var reference = (name) => `${registryName}.${name}`;
var registeredReference = (value2) => reference(register(value2));

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/compile.js
var CompiledFunction = class extends CastableBase {
  argNames;
  body = "";
  constructor(...args2) {
    super();
    this.argNames = args2;
    for (const arg of args2) {
      if (arg in this) {
        throw new Error(`Arg name '${arg}' would overwrite an existing property on FunctionBody`);
      }
      ;
      this[arg] = arg;
    }
  }
  indentation = 0;
  indent() {
    this.indentation += 4;
    return this;
  }
  dedent() {
    this.indentation -= 4;
    return this;
  }
  prop(key, optional = false) {
    return compileLiteralPropAccess(key, optional);
  }
  index(key, optional = false) {
    return indexPropAccess(`${key}`, optional);
  }
  line(statement) {
    ;
    this.body += `${" ".repeat(this.indentation)}${statement}
`;
    return this;
  }
  const(identifier, expression) {
    this.line(`const ${identifier} = ${expression}`);
    return this;
  }
  let(identifier, expression) {
    return this.line(`let ${identifier} = ${expression}`);
  }
  set(identifier, expression) {
    return this.line(`${identifier} = ${expression}`);
  }
  if(condition, then) {
    return this.block(`if (${condition})`, then);
  }
  elseIf(condition, then) {
    return this.block(`else if (${condition})`, then);
  }
  else(then) {
    return this.block("else", then);
  }
  /** Current index is "i" */
  for(until, body, initialValue = 0) {
    return this.block(`for (let i = ${initialValue}; ${until}; i++)`, body);
  }
  /** Current key is "k" */
  forIn(object2, body) {
    return this.block(`for (const k in ${object2})`, body);
  }
  block(prefix, contents, suffix2 = "") {
    this.line(`${prefix} {`);
    this.indent();
    contents(this);
    this.dedent();
    return this.line(`}${suffix2}`);
  }
  return(expression = "") {
    return this.line(`return ${expression}`);
  }
  write(name = "anonymous", indent2 = 0) {
    return `${name}(${this.argNames.join(", ")}) { ${indent2 ? this.body.split("\n").map((l) => " ".repeat(indent2) + `${l}`).join("\n") : this.body} }`;
  }
  compile() {
    return new DynamicFunction(...this.argNames, this.body);
  }
};
var compileSerializedValue = (value2) => hasDomain(value2, "object") || typeof value2 === "symbol" ? registeredReference(value2) : serializePrimitive(value2);
var compileLiteralPropAccess = (key, optional = false) => {
  if (typeof key === "string" && isDotAccessible(key))
    return `${optional ? "?" : ""}.${key}`;
  return indexPropAccess(serializeLiteralKey(key), optional);
};
var serializeLiteralKey = (key) => typeof key === "symbol" ? registeredReference(key) : JSON.stringify(key);
var indexPropAccess = (key, optional = false) => `${optional ? "?." : ""}[${key}]`;
var NodeCompiler = class extends CompiledFunction {
  traversalKind;
  optimistic;
  constructor(ctx) {
    super("data", "ctx");
    this.traversalKind = ctx.kind;
    this.optimistic = ctx.optimistic === true;
  }
  invoke(node2, opts) {
    const arg = opts?.arg ?? this.data;
    const requiresContext = typeof node2 === "string" ? true : this.requiresContextFor(node2);
    const id = typeof node2 === "string" ? node2 : node2.id;
    if (requiresContext)
      return `${this.referenceToId(id, opts)}(${arg}, ${this.ctx})`;
    return `${this.referenceToId(id, opts)}(${arg})`;
  }
  referenceToId(id, opts) {
    const invokedKind = opts?.kind ?? this.traversalKind;
    const base = `this.${id}${invokedKind}`;
    return opts?.bind ? `${base}.bind(${opts?.bind})` : base;
  }
  requiresContextFor(node2) {
    return this.traversalKind === "Apply" || node2.allowsRequiresContext;
  }
  initializeErrorCount() {
    return this.const("errorCount", "ctx.currentErrorCount");
  }
  returnIfFail() {
    return this.if("ctx.currentErrorCount > errorCount", () => this.return());
  }
  returnIfFailFast() {
    return this.if("ctx.failFast && ctx.currentErrorCount > errorCount", () => this.return());
  }
  traverseKey(keyExpression, accessExpression, node2) {
    const requiresContext = this.requiresContextFor(node2);
    if (requiresContext)
      this.line(`${this.ctx}.path.push(${keyExpression})`);
    this.check(node2, {
      arg: accessExpression
    });
    if (requiresContext)
      this.line(`${this.ctx}.path.pop()`);
    return this;
  }
  check(node2, opts) {
    return this.traversalKind === "Allows" ? this.if(`!${this.invoke(node2, opts)}`, () => this.return(false)) : this.line(this.invoke(node2, opts));
  }
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/utils.js
var makeRootAndArrayPropertiesMutable = (o) => (
  // this cast should not be required, but it seems TS is referencing
  // the wrong parameters here?
  flatMorph(o, (k, v) => [k, isArray(v) ? [...v] : v])
);
var arkKind = noSuggest("arkKind");
var hasArkKind = (value2, kind) => value2?.[arkKind] === kind;
var isNode = (value2) => hasArkKind(value2, "root") || hasArkKind(value2, "constraint");

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/implement.js
var basisKinds = ["unit", "proto", "domain"];
var structuralKinds = [
  "required",
  "optional",
  "index",
  "sequence"
];
var prestructuralKinds = [
  "pattern",
  "divisor",
  "exactLength",
  "max",
  "min",
  "maxLength",
  "minLength",
  "before",
  "after"
];
var refinementKinds = [
  ...prestructuralKinds,
  "structure",
  "predicate"
];
var constraintKinds = [...refinementKinds, ...structuralKinds];
var rootKinds = [
  "alias",
  "union",
  "morph",
  "unit",
  "intersection",
  "proto",
  "domain"
];
var nodeKinds = [...rootKinds, ...constraintKinds];
var constraintKeys = flatMorph(constraintKinds, (i, kind) => [kind, 1]);
var structureKeys = flatMorph([...structuralKinds, "undeclared"], (i, k) => [k, 1]);
var precedenceByKind = flatMorph(nodeKinds, (i, kind) => [kind, i]);
var isNodeKind = (value2) => typeof value2 === "string" && value2 in precedenceByKind;
var precedenceOfKind = (kind) => precedenceByKind[kind];
var schemaKindsRightOf = (kind) => rootKinds.slice(precedenceOfKind(kind) + 1);
var unionChildKinds = [
  ...schemaKindsRightOf("union"),
  "alias"
];
var morphChildKinds = [
  ...schemaKindsRightOf("morph"),
  "alias"
];
var defaultValueSerializer = (v) => {
  if (typeof v === "string" || typeof v === "boolean" || v === null)
    return v;
  if (typeof v === "number") {
    if (Number.isNaN(v))
      return "NaN";
    if (v === Number.POSITIVE_INFINITY)
      return "Infinity";
    if (v === Number.NEGATIVE_INFINITY)
      return "-Infinity";
    return v;
  }
  return compileSerializedValue(v);
};
var compileObjectLiteral = (ctx) => {
  let result = "{ ";
  for (const [k, v] of Object.entries(ctx))
    result += `${k}: ${compileSerializedValue(v)}, `;
  return result + " }";
};
var implementNode = (_) => {
  const implementation23 = _;
  if (implementation23.hasAssociatedError) {
    implementation23.defaults.expected ??= (ctx) => "description" in ctx ? ctx.description : implementation23.defaults.description(ctx);
    implementation23.defaults.actual ??= (data) => printable(data);
    implementation23.defaults.problem ??= (ctx) => `must be ${ctx.expected}${ctx.actual ? ` (was ${ctx.actual})` : ""}`;
    implementation23.defaults.message ??= (ctx) => {
      if (ctx.path.length === 0)
        return ctx.problem;
      const problemWithLocation = `${ctx.propString} ${ctx.problem}`;
      if (problemWithLocation[0] === "[") {
        return `value at ${problemWithLocation}`;
      }
      return problemWithLocation;
    };
  }
  return implementation23;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/toJsonSchema.js
var ToJsonSchemaError = class extends Error {
  name = "ToJsonSchemaError";
  code;
  context;
  constructor(code, context) {
    super(printable(context, { quoteKeys: false, indent: 4 }));
    this.code = code;
    this.context = context;
  }
  hasCode(code) {
    return this.code === code;
  }
};
var defaultConfig = {
  target: "draft-2020-12",
  dialect: "https://json-schema.org/draft/2020-12/schema",
  useRefs: false,
  fallback: {
    arrayObject: (ctx) => ToJsonSchema.throw("arrayObject", ctx),
    arrayPostfix: (ctx) => ToJsonSchema.throw("arrayPostfix", ctx),
    defaultValue: (ctx) => ToJsonSchema.throw("defaultValue", ctx),
    domain: (ctx) => ToJsonSchema.throw("domain", ctx),
    morph: (ctx) => ToJsonSchema.throw("morph", ctx),
    patternIntersection: (ctx) => ToJsonSchema.throw("patternIntersection", ctx),
    predicate: (ctx) => ToJsonSchema.throw("predicate", ctx),
    proto: (ctx) => ToJsonSchema.throw("proto", ctx),
    symbolKey: (ctx) => ToJsonSchema.throw("symbolKey", ctx),
    unit: (ctx) => ToJsonSchema.throw("unit", ctx),
    date: (ctx) => ToJsonSchema.throw("date", ctx)
  }
};
var standardFallback = {
  arrayObject: (ctx) => ctx.base,
  // draft-07 tuples keep their prefix in items
  arrayPostfix: ({ base: { items, additionalItems, ...base } }) => Array.isArray(items) ? { ...base, items } : base,
  defaultValue: () => void 0,
  domain: (ctx) => ctx.base,
  morph: (ctx) => ctx.base,
  patternIntersection: (ctx) => ctx.base,
  predicate: (ctx) => ctx.base,
  proto: (ctx) => ctx.base,
  symbolKey: (ctx) => ctx.base,
  unit: (ctx) => ctx.base,
  date: (ctx) => ctx.base
};
var ToJsonSchema = {
  Error: ToJsonSchemaError,
  throw: (...args2) => {
    throw new ToJsonSchema.Error(...args2);
  },
  throwInternalOperandError: (kind, schema2) => throwInternalError(`Unexpected JSON Schema input for ${kind}: ${printable(schema2)}`),
  defaultConfig,
  standardFallback
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/config.js
$ark.config ??= {};
var mergeConfigs = (base, merged) => {
  if (!merged)
    return base;
  const result = { ...base };
  let k;
  for (k in merged) {
    const keywords2 = { ...base.keywords };
    if (k === "keywords") {
      for (const flatAlias in merged[k]) {
        const v = merged.keywords[flatAlias];
        if (v === void 0)
          continue;
        keywords2[flatAlias] = typeof v === "string" ? { description: v } : v;
      }
      result.keywords = keywords2;
    } else if (k === "toJsonSchema") {
      result[k] = mergeToJsonSchemaConfigs(base.toJsonSchema, merged.toJsonSchema);
    } else if (isNodeKind(k)) {
      result[k] = // not casting this makes TS compute a very inefficient
      // type that is not needed
      {
        ...base[k],
        ...merged[k]
      };
    } else
      result[k] = merged[k];
  }
  return result;
};
var jsonSchemaTargetToDialect = {
  "draft-2020-12": "https://json-schema.org/draft/2020-12/schema",
  "draft-07": "http://json-schema.org/draft-07/schema#"
};
var mergeToJsonSchemaConfigs = ((baseConfig, mergedConfig) => {
  if (!baseConfig)
    return resolveTargetToDialect(mergedConfig ?? {}, void 0);
  if (!mergedConfig)
    return baseConfig;
  const result = { ...baseConfig };
  let k;
  for (k in mergedConfig) {
    if (k === "fallback") {
      result.fallback = mergeFallbacks(baseConfig.fallback, mergedConfig.fallback);
    } else
      result[k] = mergedConfig[k];
  }
  return resolveTargetToDialect(result, mergedConfig);
});
var resolveTargetToDialect = (opts, userOpts) => {
  if (userOpts?.dialect !== void 0)
    return opts;
  if (userOpts?.target !== void 0) {
    return {
      ...opts,
      dialect: jsonSchemaTargetToDialect[userOpts.target]
    };
  }
  return opts;
};
var mergeFallbacks = (base, merged) => {
  base = normalizeFallback(base);
  merged = normalizeFallback(merged);
  const result = {};
  let code;
  for (code in ToJsonSchema.defaultConfig.fallback) {
    result[code] = merged[code] ?? merged.default ?? base[code] ?? base.default ?? ToJsonSchema.defaultConfig.fallback[code];
  }
  return result;
};
var normalizeFallback = (fallback) => typeof fallback === "function" ? { default: fallback } : fallback ?? {};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/errors.js
var ArkError = class _ArkError extends CastableBase {
  [arkKind] = "error";
  path;
  data;
  nodeConfig;
  input;
  ctx;
  // TS gets confused by <code>, so internally we just use the base type for input
  constructor({ prefixPath, relativePath, ...input2 }, ctx) {
    super();
    this.input = input2;
    this.ctx = ctx;
    defineProperties(this, input2);
    const data = ctx.data;
    if (input2.code === "union") {
      input2.errors = input2.errors.flatMap((innerError) => {
        const flat2 = innerError.hasCode("union") ? innerError.errors : [innerError];
        if (!prefixPath && !relativePath)
          return flat2;
        return flat2.map((e) => e.transform((e2) => ({
          ...e2,
          path: conflatenateAll(prefixPath, e2.path, relativePath)
        })));
      });
    }
    this.nodeConfig = ctx.config[this.code];
    const basePath = [...input2.path ?? ctx.path];
    if (relativePath)
      basePath.push(...relativePath);
    if (prefixPath)
      basePath.unshift(...prefixPath);
    this.path = new ReadonlyPath(...basePath);
    this.data = "data" in input2 ? input2.data : data;
  }
  transform(f) {
    return new _ArkError(f({
      data: this.data,
      path: this.path,
      ...this.input
    }), this.ctx);
  }
  hasCode(code) {
    return this.code === code;
  }
  get propString() {
    return stringifyPath(this.path);
  }
  get expected() {
    if (this.input.expected)
      return this.input.expected;
    const config = this.meta?.expected ?? this.nodeConfig.expected;
    return typeof config === "function" ? config(this.input) : config;
  }
  get actual() {
    if (this.input.actual)
      return this.input.actual;
    const config = this.meta?.actual ?? this.nodeConfig.actual;
    return typeof config === "function" ? config(this.data) : config;
  }
  get problem() {
    if (this.input.problem)
      return this.input.problem;
    const config = this.meta?.problem ?? this.nodeConfig.problem;
    return typeof config === "function" ? config(this) : config;
  }
  get message() {
    if (this.input.message)
      return this.input.message;
    const config = this.meta?.message ?? this.nodeConfig.message;
    return typeof config === "function" ? config(this) : config;
  }
  get flat() {
    return this.hasCode("intersection") ? [...this.errors] : [this];
  }
  toJSON() {
    return {
      data: this.data,
      path: this.path,
      ...this.input,
      expected: this.expected,
      actual: this.actual,
      problem: this.problem,
      message: this.message
    };
  }
  toString() {
    return this.message;
  }
  throw() {
    throw this;
  }
};
var ArkErrors = class _ArkErrors extends ReadonlyArray {
  [arkKind] = "errors";
  /**
   * Inherited array methods (`map`, `filter`, `slice`, …) return a plain
   * `Array`, not another `ArkErrors`, so callbacks that return primitives
   * (e.g. `issues.map(i => i.message)`) cannot populate a new `ArkErrors` instance.
   */
  static get [Symbol.species]() {
    return Array;
  }
  ctx;
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }
  /**
   * Errors by a pathString representing their location.
   */
  byPath = /* @__PURE__ */ Object.create(null);
  /**
   * {@link byPath} flattened so that each value is an array of ArkError instances at that path.
   *
   * ✅ Since "intersection" errors will be flattened to their constituent `.errors`,
   * they will never be directly present in this representation.
   */
  get flatByPath() {
    return flatMorph(this.byPath, (k, v) => [k, v.flat]);
  }
  /**
   * {@link byPath} flattened so that each value is an array of problem strings at that path.
   */
  get flatProblemsByPath() {
    return flatMorph(this.byPath, (k, v) => [k, v.flat.map((e) => e.problem)]);
  }
  /**
   * All pathStrings at which errors are present mapped to the errors occuring
   * at that path or any nested path within it.
   */
  byAncestorPath = /* @__PURE__ */ Object.create(null);
  count = 0;
  mutable = this;
  /**
   * Throw a TraversalError based on these errors.
   */
  throw() {
    throw this.toTraversalError();
  }
  /**
   * Converts ArkErrors to TraversalError, a subclass of `Error` suitable for throwing with nice
   * formatting.
   */
  toTraversalError() {
    return new TraversalError(this);
  }
  /**
   * Append an ArkError to this array, ignoring duplicates.
   */
  add(error) {
    const existing = this.byPath[error.propString];
    if (existing) {
      if (error === existing)
        return;
      if (existing.hasCode("union") && existing.errors.length === 0)
        return;
      const errorIntersection = error.hasCode("union") && error.errors.length === 0 ? error : new ArkError({
        code: "intersection",
        errors: existing.hasCode("intersection") ? [...existing.errors, error] : [existing, error]
      }, this.ctx);
      const existingIndex = this.indexOf(existing);
      this.mutable[existingIndex === -1 ? this.length : existingIndex] = errorIntersection;
      this.byPath[error.propString] = errorIntersection;
      this.addAncestorPaths(error);
    } else {
      this.byPath[error.propString] = error;
      this.addAncestorPaths(error);
      this.mutable.push(error);
    }
    this.count++;
  }
  transform(f) {
    const result = new _ArkErrors(this.ctx);
    for (const e of this)
      result.add(f(e));
    return result;
  }
  /**
   * Add all errors from an ArkErrors instance, ignoring duplicates and
   * prefixing their paths with that of the current Traversal.
   */
  merge(errors) {
    for (const e of errors) {
      this.add(new ArkError({ ...e, path: [...this.ctx.path, ...e.path] }, this.ctx));
    }
  }
  /**
   * @internal
   */
  affectsPath(path) {
    if (this.length === 0)
      return false;
    return (
      // this would occur if there is an existing error at a prefix of path
      // e.g. the path is ["foo", "bar"] and there is an error at ["foo"]
      path.stringifyAncestors().some((s) => s in this.byPath) || // this would occur if there is an existing error at a suffix of path
      // e.g. the path is ["foo"] and there is an error at ["foo", "bar"]
      path.stringify() in this.byAncestorPath
    );
  }
  /**
   * A human-readable summary of all errors.
   */
  get summary() {
    return this.toString();
  }
  /**
   * Alias of {@link summary} for consistency with `Error`.
   */
  get message() {
    return this.summary;
  }
  /**
   * Alias of this ArkErrors instance for StandardSchema compatibility.
   */
  get issues() {
    return this;
  }
  toJSON() {
    return [...this.map((e) => e.toJSON())];
  }
  toString() {
    return this.join("\n");
  }
  addAncestorPaths(error) {
    for (const propString of error.path.stringifyAncestors()) {
      this.byAncestorPath[propString] = append(this.byAncestorPath[propString], error);
    }
  }
};
var TraversalError = class extends Error {
  name = "TraversalError";
  constructor(errors) {
    if (errors.length === 1)
      super(errors.summary);
    else
      super("\n" + errors.map((error) => `  \u2022 ${indent(error)}`).join("\n"));
    Object.defineProperty(this, "arkErrors", {
      value: errors,
      enumerable: false
    });
  }
};
var indent = (error) => error.toString().split("\n").join("\n  ");

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/traversal.js
var Traversal = class {
  /**
   * #### the path being validated or morphed
   *
   * ✅ array indices represented as numbers
   * ⚠️ mutated during traversal - use `path.slice(0)` to snapshot
   * 🔗 use {@link propString} for a stringified version
   */
  path = [];
  /**
   * #### {@link ArkErrors} that will be part of this traversal's finalized result
   *
   * ✅ will always be an empty array for a valid traversal
   */
  errors = new ArkErrors(this);
  /**
   * #### the original value being traversed
   */
  root;
  /**
   * #### configuration for this traversal
   *
   * ✅ options can affect traversal results and error messages
   * ✅ defaults < global config < scope config
   * ✅ does not include options configured on individual types
   */
  config;
  queuedMorphs = [];
  branches = [];
  seen = {};
  constructor(root, config) {
    this.root = root;
    this.config = config;
  }
  /**
   * #### the data being validated or morphed
   *
   * ✅ extracted from {@link root} at {@link path}
   */
  get data() {
    let result = this.root;
    for (const segment of this.path)
      result = result?.[segment];
    return result;
  }
  /**
   * #### a string representing {@link path}
   *
   * @propString
   */
  get propString() {
    return stringifyPath(this.path);
  }
  /**
   * #### add an {@link ArkError} and return `false`
   *
   * ✅ useful for predicates like `.narrow`
   */
  reject(input2) {
    this.error(input2);
    return false;
  }
  /**
   * #### add an {@link ArkError} from a description and return `false`
   *
   * ✅ useful for predicates like `.narrow`
   * 🔗 equivalent to {@link reject}({ expected })
   */
  mustBe(expected) {
    this.error(expected);
    return false;
  }
  error(input2) {
    const errCtx = typeof input2 === "object" ? input2.code ? input2 : { ...input2, code: "predicate" } : { code: "predicate", expected: input2 };
    return this.errorFromContext(errCtx);
  }
  /**
   * #### whether {@link currentBranch} (or the traversal root, outside a union) has one or more errors
   */
  hasError() {
    return this.currentErrorCount !== 0;
  }
  get currentBranch() {
    return this.branches[this.branches.length - 1];
  }
  queueMorphs(morphs) {
    const input2 = {
      path: new ReadonlyPath(...this.path),
      morphs
    };
    if (this.currentBranch)
      this.currentBranch.queuedMorphs.push(input2);
    else
      this.queuedMorphs.push(input2);
  }
  finalize(onFail) {
    if (this.queuedMorphs.length) {
      if (typeof this.root === "object" && this.root !== null && this.config.clone)
        this.root = this.config.clone(this.root);
      this.applyQueuedMorphs();
    }
    if (this.hasError())
      return onFail ? onFail(this.errors) : this.errors;
    return this.root;
  }
  get currentErrorCount() {
    return this.currentBranch ? this.currentBranch.error ? 1 : 0 : this.errors.count;
  }
  get failFast() {
    return this.branches.length !== 0;
  }
  pushBranch() {
    this.branches.push({
      error: void 0,
      queuedMorphs: []
    });
  }
  popBranch() {
    return this.branches.pop();
  }
  /**
   * @internal
   * Convenience for casting from InternalTraversal to Traversal
   * for cases where the extra methods on the external type are expected, e.g.
   * a morph or predicate.
   */
  get external() {
    return this;
  }
  errorFromNodeContext(input2) {
    return this.errorFromContext(input2);
  }
  errorFromContext(errCtx) {
    const error = new ArkError(errCtx, this);
    if (this.currentBranch)
      this.currentBranch.error = error;
    else
      this.errors.add(error);
    return error;
  }
  applyQueuedMorphs() {
    while (this.queuedMorphs.length) {
      const queuedMorphs = this.queuedMorphs;
      this.queuedMorphs = [];
      for (const { path, morphs } of queuedMorphs) {
        if (this.errors.affectsPath(path))
          continue;
        this.applyMorphsAtPath(path, morphs);
      }
    }
  }
  applyMorphsAtPath(path, morphs) {
    const key = path[path.length - 1];
    let parent;
    if (key !== void 0) {
      parent = this.root;
      for (let pathIndex = 0; pathIndex < path.length - 1; pathIndex++)
        parent = parent[path[pathIndex]];
    }
    for (const morph of morphs) {
      this.path = [...path];
      const morphIsNode = isNode(morph);
      const result = morph(parent === void 0 ? this.root : parent[key], this);
      if (result instanceof ArkError) {
        this.errors.add(result);
        break;
      }
      if (result instanceof ArkErrors) {
        if (!morphIsNode) {
          this.errors.merge(result);
        }
        this.queuedMorphs = [];
        break;
      }
      if (parent === void 0)
        this.root = result;
      else
        parent[key] = result;
      this.applyQueuedMorphs();
    }
  }
};
var traverseKey = (key, fn2, ctx) => {
  if (!ctx)
    return fn2();
  ctx.path.push(key);
  const result = fn2();
  ctx.path.pop();
  return result;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/node.js
var BaseNode = class extends Callable {
  attachments;
  $;
  onFail;
  includesTransform;
  includesContextualPredicate;
  isCyclic;
  allowsRequiresContext;
  rootApplyStrategy;
  contextFreeMorph;
  rootApply;
  referencesById;
  shallowReferences;
  flatRefs;
  flatMorphs;
  allows;
  get shallowMorphs() {
    return [];
  }
  constructor(attachments, $) {
    super((data, pipedFromCtx, onFail = this.onFail) => {
      if (pipedFromCtx) {
        this.traverseApply(data, pipedFromCtx);
        return pipedFromCtx.hasError() ? pipedFromCtx.errors : pipedFromCtx.data;
      }
      return this.rootApply(data, onFail);
    }, { attach: attachments });
    this.attachments = attachments;
    this.$ = $;
    this.onFail = this.meta.onFail ?? this.$.resolvedConfig.onFail;
    this.includesTransform = this.hasKind("morph") || this.hasKind("structure") && this.structuralMorph !== void 0 || this.hasKind("sequence") && this.inner.defaultables !== void 0;
    this.includesContextualPredicate = this.hasKind("predicate") && this.inner.predicate.length !== 1;
    this.isCyclic = this.kind === "alias";
    this.referencesById = { [this.id]: this };
    this.shallowReferences = this.hasKind("structure") ? [this, ...this.children] : this.children.reduce((acc, child) => appendUniqueNodes(acc, child.shallowReferences), [this]);
    const isStructural = this.isStructural();
    this.flatRefs = [];
    this.flatMorphs = [];
    for (let i = 0; i < this.children.length; i++) {
      this.includesTransform ||= this.children[i].includesTransform;
      this.includesContextualPredicate ||= this.children[i].includesContextualPredicate;
      this.isCyclic ||= this.children[i].isCyclic;
      if (!isStructural) {
        const childFlatRefs = this.children[i].flatRefs;
        for (let j = 0; j < childFlatRefs.length; j++) {
          const childRef = childFlatRefs[j];
          if (!this.flatRefs.some((existing) => flatRefsAreEqual(existing, childRef))) {
            this.flatRefs.push(childRef);
            for (const branch of childRef.node.branches) {
              if (branch.hasKind("morph") || branch.hasKind("intersection") && branch.structure?.structuralMorph !== void 0) {
                this.flatMorphs.push({
                  path: childRef.path,
                  propString: childRef.propString,
                  node: branch
                });
              }
            }
          }
        }
      }
      Object.assign(this.referencesById, this.children[i].referencesById);
    }
    this.flatRefs.sort((l, r) => l.path.length > r.path.length ? 1 : l.path.length < r.path.length ? -1 : l.propString > r.propString ? 1 : l.propString < r.propString ? -1 : l.node.expression < r.node.expression ? -1 : 1);
    this.allowsRequiresContext = this.includesContextualPredicate || this.isCyclic;
    this.rootApplyStrategy = !this.allowsRequiresContext && this.flatMorphs.length === 0 ? this.shallowMorphs.length === 0 ? "allows" : this.shallowMorphs.every((morph) => morph.length === 1 || morph.name === "$arkStructuralMorph") ? this.hasKind("union") ? (
      // multiple morphs not yet supported for optimistic compilation
      this.branches.some((branch) => branch.shallowMorphs.length > 1) ? "contextual" : "branchedOptimistic"
    ) : this.shallowMorphs.length > 1 ? "contextual" : "optimistic" : "contextual" : "contextual";
    this.rootApply = this.createRootApply();
    this.allows = this.allowsRequiresContext ? (data) => this.traverseAllows(data, new Traversal(data, this.$.resolvedConfig)) : (data) => this.traverseAllows(data);
  }
  createRootApply() {
    switch (this.rootApplyStrategy) {
      case "allows":
        return (data, onFail) => {
          if (this.allows(data))
            return data;
          const ctx = new Traversal(data, this.$.resolvedConfig);
          this.traverseApply(data, ctx);
          return ctx.finalize(onFail);
        };
      case "contextual":
        return (data, onFail) => {
          const ctx = new Traversal(data, this.$.resolvedConfig);
          this.traverseApply(data, ctx);
          return ctx.finalize(onFail);
        };
      case "optimistic":
        this.contextFreeMorph = this.shallowMorphs[0];
        const clone = this.$.resolvedConfig.clone;
        return (data, onFail) => {
          if (this.allows(data)) {
            return this.contextFreeMorph(clone && (typeof data === "object" && data !== null || typeof data === "function") ? clone(data) : data);
          }
          const ctx = new Traversal(data, this.$.resolvedConfig);
          this.traverseApply(data, ctx);
          return ctx.finalize(onFail);
        };
      case "branchedOptimistic":
        return this.createBranchedOptimisticRootApply();
      default:
        this.rootApplyStrategy;
        return throwInternalError(`Unexpected rootApplyStrategy ${this.rootApplyStrategy}`);
    }
  }
  compiledMeta = compileMeta(this.metaJson);
  cacheGetter(name, value2) {
    Object.defineProperty(this, name, { value: value2 });
    return value2;
  }
  get description() {
    return this.cacheGetter("description", this.meta?.description ?? this.$.resolvedConfig[this.kind].description(this));
  }
  // we don't cache this currently since it can be updated once a scope finishes
  // resolving cyclic references, although it may be possible to ensure it is cached safely
  get references() {
    return Object.values(this.referencesById);
  }
  precedence = precedenceOfKind(this.kind);
  precompilation;
  // defined as an arrow function since it is often detached, e.g. when passing to tRPC
  // otherwise, would run into issues with this binding
  assert = (data, pipedFromCtx) => this(data, pipedFromCtx, (errors) => errors.throw());
  traverse(data, pipedFromCtx) {
    return this(data, pipedFromCtx, null);
  }
  /** rawIn should be used internally instead */
  get in() {
    return this.cacheGetter("in", this.rawIn.isRoot() ? this.$.finalize(this.rawIn) : this.rawIn);
  }
  get rawIn() {
    return this.cacheGetter("rawIn", this.getIo("in"));
  }
  /** rawOut should be used internally instead */
  get out() {
    return this.cacheGetter("out", this.rawOut.isRoot() ? this.$.finalize(this.rawOut) : this.rawOut);
  }
  get rawOut() {
    return this.cacheGetter("rawOut", this.getIo("out"));
  }
  // Should be refactored to use transform
  // https://github.com/arktypeio/arktype/issues/1020
  getIo(ioKind) {
    if (!this.includesTransform)
      return this;
    const ioInner = {};
    for (const [k, v] of this.innerEntries) {
      const keySchemaImplementation = this.impl.keys[k];
      if (keySchemaImplementation.reduceIo)
        keySchemaImplementation.reduceIo(ioKind, ioInner, v);
      else if (keySchemaImplementation.child) {
        const childValue = v;
        ioInner[k] = isArray(childValue) ? childValue.map((child) => ioKind === "in" ? child.rawIn : child.rawOut) : ioKind === "in" ? childValue.rawIn : childValue.rawOut;
      } else
        ioInner[k] = v;
    }
    return this.$.node(this.kind, ioInner);
  }
  toJSON() {
    return this.json;
  }
  toString() {
    return `Type<${this.expression}>`;
  }
  equals(r) {
    const rNode = isNode(r) ? r : this.$.parseDefinition(r);
    return this.innerHash === rNode.innerHash;
  }
  ifEquals(r) {
    return this.equals(r) ? this : void 0;
  }
  hasKind(kind) {
    return this.kind === kind;
  }
  assertHasKind(kind) {
    if (this.kind !== kind)
      throwError(`${this.kind} node was not of asserted kind ${kind}`);
    return this;
  }
  hasKindIn(...kinds) {
    return kinds.includes(this.kind);
  }
  assertHasKindIn(...kinds) {
    if (!includes(kinds, this.kind))
      throwError(`${this.kind} node was not one of asserted kinds ${kinds}`);
    return this;
  }
  isBasis() {
    return includes(basisKinds, this.kind);
  }
  isConstraint() {
    return includes(constraintKinds, this.kind);
  }
  isStructural() {
    return includes(structuralKinds, this.kind);
  }
  isRefinement() {
    return includes(refinementKinds, this.kind);
  }
  isRoot() {
    return includes(rootKinds, this.kind);
  }
  isUnknown() {
    return this.hasKind("intersection") && this.children.length === 0;
  }
  isNever() {
    return this.hasKind("union") && this.children.length === 0;
  }
  hasUnit(value2) {
    return this.hasKind("unit") && this.allows(value2);
  }
  hasOpenIntersection() {
    return this.impl.intersectionIsOpen;
  }
  get nestableExpression() {
    return this.expression;
  }
  select(selector) {
    const normalized = NodeSelector.normalize(selector);
    return this._select(normalized);
  }
  _select(selector) {
    let nodes = NodeSelector.applyBoundary[selector.boundary ?? "references"](this);
    if (selector.kind)
      nodes = nodes.filter((n) => n.kind === selector.kind);
    if (selector.where)
      nodes = nodes.filter(selector.where);
    return NodeSelector.applyMethod[selector.method ?? "filter"](nodes, this, selector);
  }
  transform(mapper, opts) {
    return this._transform(mapper, this._createTransformContext(opts));
  }
  _createTransformContext(opts) {
    return {
      root: this,
      selected: void 0,
      seen: {},
      path: [],
      parseOptions: {
        prereduced: opts?.prereduced ?? false
      },
      undeclaredKeyHandling: void 0,
      ...opts
    };
  }
  _transform(mapper, ctx) {
    const $ = ctx.bindScope ?? this.$;
    if (ctx.seen[this.id])
      return this.$.lazilyResolve(ctx.seen[this.id]);
    if (ctx.shouldTransform?.(this, ctx) === false)
      return this;
    let transformedNode;
    ctx.seen[this.id] = () => transformedNode;
    if (this.hasKind("structure") && this.undeclared !== ctx.undeclaredKeyHandling) {
      ctx = {
        ...ctx,
        undeclaredKeyHandling: this.undeclared
      };
    }
    const innerWithTransformedChildren = flatMorph(this.inner, (k, v) => {
      if (!this.impl.keys[k].child)
        return [k, v];
      const children = v;
      if (!isArray(children)) {
        const transformed2 = children._transform(mapper, ctx);
        return transformed2 ? [k, transformed2] : [];
      }
      if (children.length === 0)
        return [k, v];
      const transformed = children.flatMap((n) => {
        const transformedChild = n._transform(mapper, ctx);
        return transformedChild ?? [];
      });
      return transformed.length ? [k, transformed] : [];
    });
    delete ctx.seen[this.id];
    const innerWithMeta = Object.assign(innerWithTransformedChildren, {
      meta: this.meta
    });
    const transformedInner = ctx.selected && !ctx.selected.includes(this) ? innerWithMeta : mapper(this.kind, innerWithMeta, ctx);
    if (transformedInner === null)
      return null;
    if (isNode(transformedInner))
      return transformedNode = transformedInner;
    const transformedKeys = Object.keys(transformedInner);
    const hasNoTypedKeys = transformedKeys.length === 0 || transformedKeys.length === 1 && transformedKeys[0] === "meta";
    if (hasNoTypedKeys && // if inner was previously an empty object (e.g. unknown) ensure it is not pruned
    !isEmptyObject(this.inner))
      return null;
    if ((this.kind === "required" || this.kind === "optional" || this.kind === "index") && !("value" in transformedInner)) {
      return ctx.undeclaredKeyHandling ? { ...transformedInner, value: $ark.intrinsic.unknown } : null;
    }
    if (this.kind === "morph") {
      ;
      transformedInner.in ??= $ark.intrinsic.unknown;
    }
    return transformedNode = $.node(this.kind, transformedInner, ctx.parseOptions);
  }
  configureReferences(meta, selector = "references") {
    const normalized = NodeSelector.normalize(selector);
    const mapper = typeof meta === "string" ? (kind, inner) => ({
      ...inner,
      meta: { ...inner.meta, description: meta }
    }) : typeof meta === "function" ? (kind, inner) => ({ ...inner, meta: meta(inner.meta) }) : (kind, inner) => ({
      ...inner,
      meta: { ...inner.meta, ...meta }
    });
    if (normalized.boundary === "self") {
      return this.$.node(this.kind, mapper(this.kind, { ...this.inner, meta: this.meta }));
    }
    const rawSelected = this._select(normalized);
    const selected = rawSelected && liftArray(rawSelected);
    const shouldTransform = normalized.boundary === "child" ? (node2, ctx) => ctx.root.children.includes(node2) : normalized.boundary === "shallow" ? (node2) => node2.kind !== "structure" : () => true;
    return this.$.finalize(this.transform(mapper, {
      shouldTransform,
      selected
    }));
  }
};
var NodeSelector = {
  applyBoundary: {
    self: (node2) => [node2],
    child: (node2) => [...node2.children],
    shallow: (node2) => [...node2.shallowReferences],
    references: (node2) => [...node2.references]
  },
  applyMethod: {
    filter: (nodes) => nodes,
    assertFilter: (nodes, from, selector) => {
      if (nodes.length === 0)
        throwError(writeSelectAssertionMessage(from, selector));
      return nodes;
    },
    find: (nodes) => nodes[0],
    assertFind: (nodes, from, selector) => {
      if (nodes.length === 0)
        throwError(writeSelectAssertionMessage(from, selector));
      return nodes[0];
    }
  },
  normalize: (selector) => typeof selector === "function" ? { boundary: "references", method: "filter", where: selector } : typeof selector === "string" ? isKeyOf(selector, NodeSelector.applyBoundary) ? { method: "filter", boundary: selector } : { boundary: "references", method: "filter", kind: selector } : { boundary: "references", method: "filter", ...selector }
};
var writeSelectAssertionMessage = (from, selector) => `${from} had no references matching ${printable(selector)}.`;
var typePathToPropString = (path) => stringifyPath(path, {
  stringifyNonKey: (node2) => node2.expression
});
var referenceMatcher = /"(\$ark\.[^"]+)"/g;
var compileMeta = (metaJson) => JSON.stringify(metaJson).replace(referenceMatcher, "$1");
var flatRef = (path, node2) => ({
  path,
  node: node2,
  propString: typePathToPropString(path)
});
var flatRefsAreEqual = (l, r) => l.propString === r.propString && l.node.equals(r.node);
var appendUniqueFlatRefs = (existing, refs) => appendUnique(existing, refs, {
  isEqual: flatRefsAreEqual
});
var appendUniqueNodes = (existing, refs) => appendUnique(existing, refs, {
  isEqual: (l, r) => l.equals(r)
});

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/disjoint.js
var Disjoint = class _Disjoint extends Array {
  static init(kind, l, r, ctx) {
    return new _Disjoint({
      kind,
      l,
      r,
      path: ctx?.path ?? [],
      optional: ctx?.optional ?? false
    });
  }
  add(kind, l, r, ctx) {
    this.push({
      kind,
      l,
      r,
      path: ctx?.path ?? [],
      optional: ctx?.optional ?? false
    });
    return this;
  }
  get summary() {
    return this.describeReasons();
  }
  describeReasons() {
    if (this.length === 1) {
      const { path, l, r } = this[0];
      const pathString = stringifyPath(path);
      return writeUnsatisfiableExpressionError(`Intersection${pathString && ` at ${pathString}`} of ${describeReasons(l, r)}`);
    }
    return `The following intersections result in unsatisfiable types:
\u2022 ${this.map(({ path, l, r }) => `${path}: ${describeReasons(l, r)}`).join("\n\u2022 ")}`;
  }
  throw() {
    return throwParseError(this.describeReasons());
  }
  invert() {
    const result = this.map((entry) => ({
      ...entry,
      l: entry.r,
      r: entry.l
    }));
    if (!(result instanceof _Disjoint))
      return new _Disjoint(...result);
    return result;
  }
  withPrefixKey(key, kind) {
    const result = this.map((entry) => ({
      ...entry,
      path: [key, ...entry.path],
      optional: entry.optional || kind === "optional"
    }));
    if (!(result instanceof _Disjoint))
      return new _Disjoint(...result);
    return result;
  }
  toNeverIfDisjoint() {
    return $ark.intrinsic.never;
  }
};
var describeReasons = (l, r) => `${describeReason(l)} and ${describeReason(r)}`;
var describeReason = (value2) => isNode(value2) ? value2.expression : isArray(value2) ? value2.map(describeReason).join(" | ") || "never" : String(value2);
var writeUnsatisfiableExpressionError = (expression) => `${expression} results in an unsatisfiable type`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/shared/intersections.js
var intersectionCache = {};
var intersectNodesRoot = (l, r, $) => intersectOrPipeNodes(l, r, {
  $,
  invert: false,
  pipe: false
});
var pipeNodesRoot = (l, r, $) => intersectOrPipeNodes(l, r, {
  $,
  invert: false,
  pipe: true
});
var intersectOrPipeNodes = ((l, r, ctx) => {
  const operator = ctx.pipe ? "|>" : "&";
  const lrCacheKey = `${l.hash}${operator}${r.hash}`;
  if (intersectionCache[lrCacheKey] !== void 0)
    return intersectionCache[lrCacheKey];
  if (!ctx.pipe) {
    const rlCacheKey = `${r.hash}${operator}${l.hash}`;
    if (intersectionCache[rlCacheKey] !== void 0) {
      const rlResult = intersectionCache[rlCacheKey];
      const lrResult = rlResult instanceof Disjoint ? rlResult.invert() : rlResult;
      intersectionCache[lrCacheKey] = lrResult;
      return lrResult;
    }
  }
  const isPureIntersection = !ctx.pipe || !l.includesTransform && !r.includesTransform;
  if (isPureIntersection && l.equals(r))
    return l;
  let result = isPureIntersection ? _intersectNodes(l, r, ctx) : l.hasKindIn(...rootKinds) ? (
    // if l is a RootNode, r will be as well
    _pipeNodes(l, r, ctx)
  ) : _intersectNodes(l, r, ctx);
  if (isNode(result)) {
    if (l.equals(result))
      result = l;
    else if (r.equals(result))
      result = r;
  }
  intersectionCache[lrCacheKey] = result;
  return result;
});
var _intersectNodes = (l, r, ctx) => {
  const leftmostKind = l.precedence < r.precedence ? l.kind : r.kind;
  const implementation23 = l.impl.intersections[r.kind] ?? r.impl.intersections[l.kind];
  if (implementation23 === void 0) {
    return null;
  } else if (leftmostKind === l.kind)
    return implementation23(l, r, ctx);
  else {
    let result = implementation23(r, l, { ...ctx, invert: !ctx.invert });
    if (result instanceof Disjoint)
      result = result.invert();
    return result;
  }
};
var _pipeNodes = (l, r, ctx) => l.includesTransform || r.includesTransform ? ctx.invert ? pipeMorphed(r, l, ctx) : pipeMorphed(l, r, ctx) : _intersectNodes(l, r, ctx);
var pipeMorphed = (from, to, ctx) => from.distribute((fromBranch) => _pipeMorphed(fromBranch, to, ctx), (results) => {
  const viableBranches = results.filter(isNode);
  if (viableBranches.length === 0)
    return Disjoint.init("union", from.branches, to.branches);
  if (viableBranches.length < from.branches.length || !from.branches.every((branch, i) => branch.rawIn.equals(viableBranches[i].rawIn)))
    return ctx.$.parseSchema(viableBranches);
  let meta;
  if (viableBranches.length === 1) {
    const onlyBranch = viableBranches[0];
    if (!meta)
      return onlyBranch;
    return ctx.$.node("morph", {
      ...onlyBranch.inner,
      in: onlyBranch.rawIn.configure(meta, "self")
    });
  }
  const schema2 = {
    branches: viableBranches
  };
  if (meta)
    schema2.meta = meta;
  return ctx.$.parseSchema(schema2);
});
var _pipeMorphed = (from, to, ctx) => {
  const fromIsMorph = from.hasKind("morph");
  if (fromIsMorph) {
    const morphs = [...from.morphs];
    if (from.lastMorphIfNode) {
      const outIntersection = intersectOrPipeNodes(from.lastMorphIfNode, to, ctx);
      if (outIntersection instanceof Disjoint)
        return outIntersection;
      morphs[morphs.length - 1] = outIntersection;
    } else
      morphs.push(to);
    return ctx.$.node("morph", {
      morphs,
      in: from.inner.in
    });
  }
  if (to.hasKind("morph")) {
    const inTersection = intersectOrPipeNodes(from, to.rawIn, ctx);
    if (inTersection instanceof Disjoint)
      return inTersection;
    return ctx.$.node("morph", {
      morphs: [to],
      in: inTersection
    });
  }
  return ctx.$.node("morph", {
    morphs: [to],
    in: from
  });
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/constraint.js
var BaseConstraint = class extends BaseNode {
  constructor(attachments, $) {
    super(attachments, $);
    Object.defineProperty(this, arkKind, {
      value: "constraint",
      enumerable: false
    });
  }
  impliedSiblings;
  intersect(r) {
    return intersectNodesRoot(this, r, this.$);
  }
};
var InternalPrimitiveConstraint = class extends BaseConstraint {
  traverseApply = (data, ctx) => {
    if (!this.traverseAllows(data, ctx))
      ctx.errorFromNodeContext(this.errorContext);
  };
  compile(js) {
    if (js.traversalKind === "Allows")
      js.return(this.compiledCondition);
    else {
      js.if(this.compiledNegation, () => js.line(`ctx.errorFromNodeContext(${this.compiledErrorContext})`));
    }
  }
  get errorContext() {
    return {
      code: this.kind,
      description: this.description,
      meta: this.meta,
      ...this.inner
    };
  }
  get compiledErrorContext() {
    return compileObjectLiteral(this.errorContext);
  }
};
var constraintKeyParser = (kind) => (schema2, ctx) => {
  if (isArray(schema2)) {
    if (schema2.length === 0) {
      return;
    }
    const nodes = schema2.map((schema3) => ctx.$.node(kind, schema3));
    if (kind === "predicate")
      return nodes;
    return nodes.sort((l, r) => l.hash < r.hash ? -1 : 1);
  }
  const child = ctx.$.node(kind, schema2);
  if (child.isRoot())
    return;
  return child.hasOpenIntersection() ? [child] : child;
};
var intersectConstraints = (s) => {
  const head = s.r.shift();
  if (!head) {
    let result = s.l.length === 0 && s.kind === "structure" ? $ark.intrinsic.unknown.internal : s.ctx.$.node(s.kind, Object.assign(s.baseInner, unflattenConstraints(s.l)), { prereduced: true });
    for (const root of s.roots) {
      if (result instanceof Disjoint)
        return result;
      result = intersectOrPipeNodes(root, result, s.ctx);
    }
    return result;
  }
  let matched = false;
  for (let i = 0; i < s.l.length; i++) {
    const result = intersectOrPipeNodes(s.l[i], head, s.ctx);
    if (result === null)
      continue;
    if (result instanceof Disjoint)
      return result;
    if (result.isRoot()) {
      s.roots.push(result);
      s.l.splice(i);
      return intersectConstraints(s);
    }
    if (!matched) {
      s.l[i] = result;
      matched = true;
    } else {
      s.l.splice(i--, 1);
      if (!s.l.includes(result))
        s.r.push(result);
    }
  }
  if (!matched)
    s.l.push(head);
  if (s.kind === "intersection") {
    if (head.impliedSiblings)
      for (const node2 of head.impliedSiblings)
        appendUnique(s.r, node2);
  }
  return intersectConstraints(s);
};
var flattenConstraints = (inner) => {
  const result = Object.entries(inner).flatMap(([k, v]) => k in constraintKeys ? v : []).sort((l, r) => l.precedence < r.precedence ? -1 : l.precedence > r.precedence ? 1 : l.kind === "predicate" && r.kind === "predicate" ? 0 : l.hash < r.hash ? -1 : 1);
  return result;
};
var unflattenConstraints = (constraints) => {
  const inner = {};
  for (const constraint of constraints) {
    if (constraint.hasOpenIntersection()) {
      inner[constraint.kind] = append(inner[constraint.kind], constraint);
    } else {
      if (inner[constraint.kind]) {
        return throwInternalError(`Unexpected intersection of closed refinements of kind ${constraint.kind}`);
      }
      inner[constraint.kind] = constraint;
    }
  }
  return inner;
};
var throwInvalidOperandError = (...args2) => throwParseError(writeInvalidOperandMessage(...args2));
var writeInvalidOperandMessage = (kind, expected, actual) => {
  const actualDescription = actual.hasKind("morph") ? "a morph" : actual.isUnknown() ? "unknown" : actual.exclude(expected).defaultShortDescription;
  return `${capitalize(kind)} operand must be ${expected.description} (was ${actualDescription})`;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/generic.js
var parseGeneric = (paramDefs, bodyDef, $) => new GenericRoot(paramDefs, bodyDef, $, $, null);
var LazyGenericBody = class extends Callable {
};
var GenericRoot = class extends Callable {
  [arkKind] = "generic";
  paramDefs;
  bodyDef;
  $;
  arg$;
  baseInstantiation;
  hkt;
  description;
  constructor(paramDefs, bodyDef, $, arg$, hkt) {
    super((...args2) => {
      const argNodes = flatMorph(this.names, (i, name) => {
        const arg = this.arg$.parse(args2[i]);
        if (!arg.extends(this.constraints[i])) {
          throwParseError(writeUnsatisfiedParameterConstraintMessage(name, this.constraints[i].expression, arg.expression));
        }
        return [name, arg];
      });
      if (this.defIsLazy()) {
        const def = this.bodyDef(argNodes);
        return this.$.parse(def);
      }
      return this.$.parse(bodyDef, { args: argNodes });
    });
    this.paramDefs = paramDefs;
    this.bodyDef = bodyDef;
    this.$ = $;
    this.arg$ = arg$;
    this.hkt = hkt;
    this.description = hkt ? new hkt().description ?? `a generic type for ${hkt.constructor.name}` : "a generic type";
    this.baseInstantiation = this(...this.constraints);
  }
  defIsLazy() {
    return this.bodyDef instanceof LazyGenericBody;
  }
  cacheGetter(name, value2) {
    Object.defineProperty(this, name, { value: value2 });
    return value2;
  }
  get json() {
    return this.cacheGetter("json", {
      params: this.params.map((param) => param[1].isUnknown() ? param[0] : [param[0], param[1].json]),
      body: snapshot(this.bodyDef)
    });
  }
  get params() {
    return this.cacheGetter("params", this.paramDefs.map((param) => typeof param === "string" ? [param, $ark.intrinsic.unknown] : [param[0], this.$.parse(param[1])]));
  }
  get names() {
    return this.cacheGetter("names", this.params.map((e) => e[0]));
  }
  get constraints() {
    return this.cacheGetter("constraints", this.params.map((e) => e[1]));
  }
  get internal() {
    return this;
  }
  get referencesById() {
    return this.baseInstantiation.internal.referencesById;
  }
  get references() {
    return this.baseInstantiation.internal.references;
  }
};
var writeUnsatisfiedParameterConstraintMessage = (name, constraint, arg) => `${name} must be assignable to ${constraint} (was ${arg})`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/predicate.js
var describePredicate = (predicate) => `valid according to ${predicate?.name || "an anonymous predicate"}`;
var implementation = implementNode({
  kind: "predicate",
  hasAssociatedError: true,
  collapsibleKey: "predicate",
  keys: {
    predicate: {}
  },
  normalize: (schema2) => typeof schema2 === "function" ? { predicate: schema2 } : schema2,
  defaults: {
    description: (node2) => describePredicate(node2.predicate),
    // error contexts from ctx.reject have neither a description nor a predicate
    expected: (ctx) => ctx.description ?? describePredicate(ctx.predicate)
  },
  intersectionIsOpen: true,
  intersections: {
    // as long as the narrows in l and r are individually safe to check
    // in the order they're specified, checking them in the order
    // resulting from this intersection should also be safe.
    predicate: () => null
  }
});
var PredicateNode = class extends BaseConstraint {
  serializedPredicate = registeredReference(this.predicate);
  compiledCondition = `${this.serializedPredicate}(data, ctx)`;
  compiledNegation = `!${this.compiledCondition}`;
  impliedBasis = null;
  expression = this.serializedPredicate;
  traverseAllows = this.predicate;
  errorContext = {
    code: "predicate",
    description: this.description,
    meta: this.meta
  };
  compiledErrorContext = compileObjectLiteral(this.errorContext);
  traverseApply = (data, ctx) => {
    const errorCount = ctx.currentErrorCount;
    if (!this.predicate(data, ctx.external) && ctx.currentErrorCount === errorCount)
      ctx.errorFromNodeContext(this.errorContext);
  };
  compile(js) {
    if (js.traversalKind === "Allows") {
      js.return(this.compiledCondition);
      return;
    }
    js.initializeErrorCount();
    js.if(
      // only add the default error if the predicate didn't add one itself
      `${this.compiledNegation} && ctx.currentErrorCount === errorCount`,
      () => js.line(`ctx.errorFromNodeContext(${this.compiledErrorContext})`)
    );
  }
  reduceJsonSchema(base, ctx) {
    return ctx.fallback.predicate({
      code: "predicate",
      base,
      predicate: this.predicate
    });
  }
};
var Predicate = {
  implementation,
  Node: PredicateNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/divisor.js
var implementation2 = implementNode({
  kind: "divisor",
  collapsibleKey: "rule",
  keys: {
    rule: {
      parse: (divisor) => Number.isInteger(divisor) ? divisor : throwParseError(writeNonIntegerDivisorMessage(divisor))
    }
  },
  normalize: (schema2) => typeof schema2 === "number" ? { rule: schema2 } : schema2,
  hasAssociatedError: true,
  defaults: {
    description: (node2) => node2.rule === 1 ? "an integer" : node2.rule === 2 ? "even" : `a multiple of ${node2.rule}`
  },
  intersections: {
    divisor: (l, r, ctx) => ctx.$.node("divisor", {
      rule: Math.abs(l.rule * r.rule / greatestCommonDivisor(l.rule, r.rule))
    })
  },
  obviatesBasisDescription: true
});
var DivisorNode = class extends InternalPrimitiveConstraint {
  traverseAllows = (data) => data % this.rule === 0;
  compiledCondition = `data % ${this.rule} === 0`;
  compiledNegation = `data % ${this.rule} !== 0`;
  impliedBasis = $ark.intrinsic.number.internal;
  expression = `% ${this.rule}`;
  reduceJsonSchema(schema2) {
    schema2.type = "integer";
    if (this.rule === 1)
      return schema2;
    schema2.multipleOf = this.rule;
    return schema2;
  }
};
var Divisor = {
  implementation: implementation2,
  Node: DivisorNode
};
var writeNonIntegerDivisorMessage = (divisor) => `divisor must be an integer (was ${divisor})`;
var greatestCommonDivisor = (l, r) => {
  let previous;
  let greatestCommonDivisor2 = l;
  let current = r;
  while (current !== 0) {
    previous = current;
    current = greatestCommonDivisor2 % current;
    greatestCommonDivisor2 = previous;
  }
  return greatestCommonDivisor2;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/range.js
var BaseRange = class extends InternalPrimitiveConstraint {
  boundOperandKind = operandKindsByBoundKind[this.kind];
  compiledActual = this.boundOperandKind === "value" ? `data` : this.boundOperandKind === "length" ? `data.length` : `data.valueOf()`;
  comparator = compileComparator(this.kind, this.exclusive);
  numericLimit = this.rule.valueOf();
  expression = `${this.comparator} ${this.rule}`;
  compiledCondition = `${this.compiledActual} ${this.comparator} ${this.numericLimit}`;
  compiledNegation = `${this.compiledActual} ${negatedComparators[this.comparator]} ${this.numericLimit}`;
  // we need to compute stringLimit before errorContext, which references it
  // transitively through description for date bounds
  stringLimit = this.boundOperandKind === "date" ? dateLimitToString(this.numericLimit) : `${this.numericLimit}`;
  limitKind = this.comparator["0"] === "<" ? "upper" : "lower";
  isStricterThan(r) {
    const thisLimitIsStricter = this.limitKind === "upper" ? this.numericLimit < r.numericLimit : this.numericLimit > r.numericLimit;
    return thisLimitIsStricter || this.numericLimit === r.numericLimit && this.exclusive === true && !r.exclusive;
  }
  overlapsRange(r) {
    if (this.isStricterThan(r))
      return false;
    if (this.numericLimit === r.numericLimit && (this.exclusive || r.exclusive))
      return false;
    return true;
  }
  overlapIsUnit(r) {
    return this.numericLimit === r.numericLimit && !this.exclusive && !r.exclusive;
  }
};
var negatedComparators = {
  "<": ">=",
  "<=": ">",
  ">": "<=",
  ">=": "<"
};
var boundKindPairsByLower = {
  min: "max",
  minLength: "maxLength",
  after: "before"
};
var parseExclusiveKey = {
  // omit key with value false since it is the default
  parse: (flag) => flag || void 0
};
var createLengthSchemaNormalizer = (kind) => (schema2) => {
  if (typeof schema2 === "number")
    return { rule: schema2 };
  const { exclusive, ...normalized } = schema2;
  return exclusive ? {
    ...normalized,
    rule: kind === "minLength" ? normalized.rule + 1 : normalized.rule - 1
  } : normalized;
};
var createDateSchemaNormalizer = (kind) => (schema2) => {
  if (typeof schema2 === "number" || typeof schema2 === "string" || schema2 instanceof Date)
    return { rule: schema2 };
  const { exclusive, ...normalized } = schema2;
  if (!exclusive)
    return normalized;
  const numericLimit = typeof normalized.rule === "number" ? normalized.rule : typeof normalized.rule === "string" ? new Date(normalized.rule).valueOf() : normalized.rule.valueOf();
  return exclusive ? {
    ...normalized,
    rule: kind === "after" ? numericLimit + 1 : numericLimit - 1
  } : normalized;
};
var parseDateLimit = (limit) => typeof limit === "string" || typeof limit === "number" ? new Date(limit) : limit;
var writeInvalidLengthBoundMessage = (kind, limit) => `${kind} bound must be a positive integer (was ${limit})`;
var createLengthRuleParser = (kind) => (limit) => {
  if (!Number.isInteger(limit) || limit < 0)
    throwParseError(writeInvalidLengthBoundMessage(kind, limit));
  return limit;
};
var operandKindsByBoundKind = {
  min: "value",
  max: "value",
  minLength: "length",
  maxLength: "length",
  after: "date",
  before: "date"
};
var compileComparator = (kind, exclusive) => `${isKeyOf(kind, boundKindPairsByLower) ? ">" : "<"}${exclusive ? "" : "="}`;
var dateLimitToString = (limit) => typeof limit === "string" ? limit : new Date(limit).toLocaleString();
var writeUnboundableMessage = (root) => `Bounded expression ${root} must be exactly one of number, string, Array, or Date`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/after.js
var implementation3 = implementNode({
  kind: "after",
  collapsibleKey: "rule",
  hasAssociatedError: true,
  keys: {
    rule: {
      parse: parseDateLimit,
      serialize: (schema2) => schema2.toISOString()
    }
  },
  normalize: createDateSchemaNormalizer("after"),
  defaults: {
    description: (node2) => `${node2.collapsibleLimitString} or later`,
    actual: describeCollapsibleDate
  },
  intersections: {
    after: (l, r) => l.isStricterThan(r) ? l : r
  }
});
var AfterNode = class extends BaseRange {
  impliedBasis = $ark.intrinsic.Date.internal;
  collapsibleLimitString = describeCollapsibleDate(this.rule);
  traverseAllows = (data) => data >= this.rule;
  reduceJsonSchema(base, ctx) {
    return ctx.fallback.date({ code: "date", base, after: this.rule });
  }
};
var After = {
  implementation: implementation3,
  Node: AfterNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/before.js
var implementation4 = implementNode({
  kind: "before",
  collapsibleKey: "rule",
  hasAssociatedError: true,
  keys: {
    rule: {
      parse: parseDateLimit,
      serialize: (schema2) => schema2.toISOString()
    }
  },
  normalize: createDateSchemaNormalizer("before"),
  defaults: {
    description: (node2) => `${node2.collapsibleLimitString} or earlier`,
    actual: describeCollapsibleDate
  },
  intersections: {
    before: (l, r) => l.isStricterThan(r) ? l : r,
    after: (before, after, ctx) => before.overlapsRange(after) ? before.overlapIsUnit(after) ? ctx.$.node("unit", { unit: before.rule }) : null : Disjoint.init("range", before, after)
  }
});
var BeforeNode = class extends BaseRange {
  collapsibleLimitString = describeCollapsibleDate(this.rule);
  traverseAllows = (data) => data <= this.rule;
  impliedBasis = $ark.intrinsic.Date.internal;
  reduceJsonSchema(base, ctx) {
    return ctx.fallback.date({ code: "date", base, before: this.rule });
  }
};
var Before = {
  implementation: implementation4,
  Node: BeforeNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/exactLength.js
var implementation5 = implementNode({
  kind: "exactLength",
  collapsibleKey: "rule",
  keys: {
    rule: {
      parse: createLengthRuleParser("exactLength")
    }
  },
  normalize: (schema2) => typeof schema2 === "number" ? { rule: schema2 } : schema2,
  hasAssociatedError: true,
  defaults: {
    description: (node2) => `exactly length ${node2.rule}`,
    actual: (data) => `${data.length}`
  },
  intersections: {
    exactLength: (l, r, ctx) => Disjoint.init("unit", ctx.$.node("unit", { unit: l.rule }), ctx.$.node("unit", { unit: r.rule }), { path: ["length"] }),
    minLength: (exactLength, minLength) => exactLength.rule >= minLength.rule ? exactLength : Disjoint.init("range", exactLength, minLength),
    maxLength: (exactLength, maxLength) => exactLength.rule <= maxLength.rule ? exactLength : Disjoint.init("range", exactLength, maxLength)
  }
});
var ExactLengthNode = class extends InternalPrimitiveConstraint {
  traverseAllows = (data) => data.length === this.rule;
  compiledCondition = `data.length === ${this.rule}`;
  compiledNegation = `data.length !== ${this.rule}`;
  impliedBasis = $ark.intrinsic.lengthBoundable.internal;
  expression = `== ${this.rule}`;
  reduceJsonSchema(schema2) {
    switch (schema2.type) {
      case "string":
        schema2.minLength = this.rule;
        schema2.maxLength = this.rule;
        return schema2;
      case "array":
        schema2.minItems = this.rule;
        schema2.maxItems = this.rule;
        return schema2;
      default:
        return ToJsonSchema.throwInternalOperandError("exactLength", schema2);
    }
  }
};
var ExactLength = {
  implementation: implementation5,
  Node: ExactLengthNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/max.js
var implementation6 = implementNode({
  kind: "max",
  collapsibleKey: "rule",
  hasAssociatedError: true,
  keys: {
    rule: {},
    exclusive: parseExclusiveKey
  },
  normalize: (schema2) => typeof schema2 === "number" ? { rule: schema2 } : schema2,
  defaults: {
    description: (node2) => {
      if (node2.rule === 0)
        return node2.exclusive ? "negative" : "non-positive";
      return `${node2.exclusive ? "less than" : "at most"} ${node2.rule}`;
    }
  },
  intersections: {
    max: (l, r) => l.isStricterThan(r) ? l : r,
    min: (max, min, ctx) => max.overlapsRange(min) ? max.overlapIsUnit(min) ? ctx.$.node("unit", { unit: max.rule }) : null : Disjoint.init("range", max, min)
  },
  obviatesBasisDescription: true
});
var MaxNode = class extends BaseRange {
  impliedBasis = $ark.intrinsic.number.internal;
  traverseAllows = this.exclusive ? (data) => data < this.rule : (data) => data <= this.rule;
  reduceJsonSchema(schema2) {
    if (this.exclusive)
      schema2.exclusiveMaximum = this.rule;
    else
      schema2.maximum = this.rule;
    return schema2;
  }
};
var Max = {
  implementation: implementation6,
  Node: MaxNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/maxLength.js
var implementation7 = implementNode({
  kind: "maxLength",
  collapsibleKey: "rule",
  hasAssociatedError: true,
  keys: {
    rule: {
      parse: createLengthRuleParser("maxLength")
    }
  },
  reduce: (inner, $) => inner.rule === 0 ? $.node("exactLength", inner) : void 0,
  normalize: createLengthSchemaNormalizer("maxLength"),
  defaults: {
    description: (node2) => `at most length ${node2.rule}`,
    actual: (data) => `${data.length}`
  },
  intersections: {
    maxLength: (l, r) => l.isStricterThan(r) ? l : r,
    minLength: (max, min, ctx) => max.overlapsRange(min) ? max.overlapIsUnit(min) ? ctx.$.node("exactLength", { rule: max.rule }) : null : Disjoint.init("range", max, min)
  }
});
var MaxLengthNode = class extends BaseRange {
  impliedBasis = $ark.intrinsic.lengthBoundable.internal;
  traverseAllows = (data) => data.length <= this.rule;
  reduceJsonSchema(schema2) {
    switch (schema2.type) {
      case "string":
        schema2.maxLength = this.rule;
        return schema2;
      case "array":
        schema2.maxItems = this.rule;
        return schema2;
      default:
        return ToJsonSchema.throwInternalOperandError("maxLength", schema2);
    }
  }
};
var MaxLength = {
  implementation: implementation7,
  Node: MaxLengthNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/min.js
var implementation8 = implementNode({
  kind: "min",
  collapsibleKey: "rule",
  hasAssociatedError: true,
  keys: {
    rule: {},
    exclusive: parseExclusiveKey
  },
  normalize: (schema2) => typeof schema2 === "number" ? { rule: schema2 } : schema2,
  defaults: {
    description: (node2) => {
      if (node2.rule === 0)
        return node2.exclusive ? "positive" : "non-negative";
      return `${node2.exclusive ? "more than" : "at least"} ${node2.rule}`;
    }
  },
  intersections: {
    min: (l, r) => l.isStricterThan(r) ? l : r
  },
  obviatesBasisDescription: true
});
var MinNode = class extends BaseRange {
  impliedBasis = $ark.intrinsic.number.internal;
  traverseAllows = this.exclusive ? (data) => data > this.rule : (data) => data >= this.rule;
  reduceJsonSchema(schema2) {
    if (this.exclusive)
      schema2.exclusiveMinimum = this.rule;
    else
      schema2.minimum = this.rule;
    return schema2;
  }
};
var Min = {
  implementation: implementation8,
  Node: MinNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/minLength.js
var implementation9 = implementNode({
  kind: "minLength",
  collapsibleKey: "rule",
  hasAssociatedError: true,
  keys: {
    rule: {
      parse: createLengthRuleParser("minLength")
    }
  },
  reduce: (inner) => inner.rule === 0 ? (
    // a minimum length of zero is trivially satisfied
    $ark.intrinsic.unknown
  ) : void 0,
  normalize: createLengthSchemaNormalizer("minLength"),
  defaults: {
    description: (node2) => node2.rule === 1 ? "non-empty" : `at least length ${node2.rule}`,
    // avoid default message like "must be non-empty (was 0)"
    actual: (data) => data.length === 0 ? "" : `${data.length}`
  },
  intersections: {
    minLength: (l, r) => l.isStricterThan(r) ? l : r
  }
});
var MinLengthNode = class extends BaseRange {
  impliedBasis = $ark.intrinsic.lengthBoundable.internal;
  traverseAllows = (data) => data.length >= this.rule;
  reduceJsonSchema(schema2) {
    switch (schema2.type) {
      case "string":
        schema2.minLength = this.rule;
        return schema2;
      case "array":
        schema2.minItems = this.rule;
        return schema2;
      default:
        return ToJsonSchema.throwInternalOperandError("minLength", schema2);
    }
  }
};
var MinLength = {
  implementation: implementation9,
  Node: MinLengthNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/kinds.js
var boundImplementationsByKind = {
  min: Min.implementation,
  max: Max.implementation,
  minLength: MinLength.implementation,
  maxLength: MaxLength.implementation,
  exactLength: ExactLength.implementation,
  after: After.implementation,
  before: Before.implementation
};
var boundClassesByKind = {
  min: Min.Node,
  max: Max.Node,
  minLength: MinLength.Node,
  maxLength: MaxLength.Node,
  exactLength: ExactLength.Node,
  after: After.Node,
  before: Before.Node
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/refinements/pattern.js
var implementation10 = implementNode({
  kind: "pattern",
  collapsibleKey: "rule",
  keys: {
    rule: {},
    flags: {}
  },
  normalize: (schema2) => typeof schema2 === "string" ? { rule: schema2 } : schema2 instanceof RegExp ? schema2.flags ? { rule: schema2.source, flags: schema2.flags } : { rule: schema2.source } : schema2,
  obviatesBasisDescription: true,
  obviatesBasisExpression: true,
  hasAssociatedError: true,
  intersectionIsOpen: true,
  defaults: {
    description: (node2) => `matched by ${node2.rule}`
  },
  intersections: {
    // for now, non-equal regex are naively intersected:
    // https://github.com/arktypeio/arktype/issues/853
    pattern: () => null
  }
});
var PatternNode = class extends InternalPrimitiveConstraint {
  instance = new RegExp(this.rule, this.flags);
  expression = `${this.instance}`;
  traverseAllows = this.instance.test.bind(this.instance);
  compiledCondition = `${this.expression}.test(data)`;
  compiledNegation = `!${this.compiledCondition}`;
  impliedBasis = $ark.intrinsic.string.internal;
  reduceJsonSchema(base, ctx) {
    if (base.pattern) {
      return ctx.fallback.patternIntersection({
        code: "patternIntersection",
        base,
        pattern: this.rule
      });
    }
    base.pattern = this.rule;
    return base;
  }
};
var Pattern = {
  implementation: implementation10,
  Node: PatternNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/parse.js
var schemaKindOf = (schema2, allowedKinds) => {
  const kind = discriminateRootKind(schema2);
  if (allowedKinds && !allowedKinds.includes(kind)) {
    return throwParseError(`Root of kind ${kind} should be one of ${allowedKinds}`);
  }
  return kind;
};
var discriminateRootKind = (schema2) => {
  if (hasArkKind(schema2, "root"))
    return schema2.kind;
  if (typeof schema2 === "string") {
    return schema2[0] === "$" ? "alias" : schema2 in domainDescriptions ? "domain" : "proto";
  }
  if (typeof schema2 === "function")
    return "proto";
  if (typeof schema2 !== "object" || schema2 === null)
    return throwParseError(writeInvalidSchemaMessage(schema2));
  if ("morphs" in schema2)
    return "morph";
  if ("branches" in schema2 || isArray(schema2))
    return "union";
  if ("unit" in schema2)
    return "unit";
  if ("reference" in schema2)
    return "alias";
  const schemaKeys = Object.keys(schema2);
  if (schemaKeys.length === 0 || schemaKeys.some((k) => k in constraintKeys))
    return "intersection";
  if ("proto" in schema2)
    return "proto";
  if ("domain" in schema2)
    return "domain";
  return throwParseError(writeInvalidSchemaMessage(schema2));
};
var writeInvalidSchemaMessage = (schema2) => `${printable(schema2)} is not a valid type schema`;
var nodeCountsByPrefix = {};
var serializeListableChild = (listableNode) => isArray(listableNode) ? listableNode.map((node2) => node2.collapsibleJson) : listableNode.collapsibleJson;
var nodesByRegisteredId = {};
$ark.nodesByRegisteredId = nodesByRegisteredId;
var registerNodeId = (prefix) => {
  nodeCountsByPrefix[prefix] ??= 0;
  return `${prefix}${++nodeCountsByPrefix[prefix]}`;
};
var parseNode = (ctx) => {
  const impl = nodeImplementationsByKind[ctx.kind];
  const configuredSchema = impl.applyConfig?.(ctx.def, ctx.$.resolvedConfig) ?? ctx.def;
  const inner = {};
  const { meta: metaSchema, ...innerSchema } = configuredSchema;
  const meta = metaSchema === void 0 ? {} : typeof metaSchema === "string" ? { description: metaSchema } : metaSchema;
  const innerSchemaEntries = entriesOf(innerSchema).sort(([lKey], [rKey]) => isNodeKind(lKey) ? isNodeKind(rKey) ? precedenceOfKind(lKey) - precedenceOfKind(rKey) : 1 : isNodeKind(rKey) ? -1 : lKey < rKey ? -1 : 1).filter(([k, v]) => {
    if (k.startsWith("meta.")) {
      const metaKey = k.slice(5);
      meta[metaKey] = v;
      return false;
    }
    return true;
  });
  for (const entry of innerSchemaEntries) {
    const k = entry[0];
    const keyImpl = impl.keys[k];
    if (!keyImpl)
      return throwParseError(`Key ${k} is not valid on ${ctx.kind} schema`);
    const v = keyImpl.parse ? keyImpl.parse(entry[1], ctx) : entry[1];
    if (v !== unset && (v !== void 0 || keyImpl.preserveUndefined))
      inner[k] = v;
  }
  if (impl.reduce && !ctx.prereduced) {
    const reduced = impl.reduce(inner, ctx.$);
    if (reduced) {
      if (reduced instanceof Disjoint)
        return reduced.throw();
      return withMeta(reduced, meta);
    }
  }
  const node2 = createNode({
    id: ctx.id,
    kind: ctx.kind,
    inner,
    meta,
    $: ctx.$
  });
  return node2;
};
var createNode = ({ id, kind, inner, meta, $, ignoreCache }) => {
  const impl = nodeImplementationsByKind[kind];
  const innerEntries = entriesOf(inner);
  const children = [];
  let innerJson = {};
  for (const [k, v] of innerEntries) {
    const keyImpl = impl.keys[k];
    const serialize = keyImpl.serialize ?? (keyImpl.child ? serializeListableChild : defaultValueSerializer);
    innerJson[k] = serialize(v);
    if (keyImpl.child === true) {
      const listableNode = v;
      if (isArray(listableNode))
        children.push(...listableNode);
      else
        children.push(listableNode);
    } else if (typeof keyImpl.child === "function")
      children.push(...keyImpl.child(v));
  }
  if (impl.finalizeInnerJson)
    innerJson = impl.finalizeInnerJson(innerJson);
  let json3 = { ...innerJson };
  let metaJson = {};
  if (!isEmptyObject(meta)) {
    metaJson = flatMorph(meta, (k, v) => [
      k,
      k === "examples" ? v : defaultValueSerializer(v)
    ]);
    json3.meta = possiblyCollapse(metaJson, "description", true);
  }
  innerJson = possiblyCollapse(innerJson, impl.collapsibleKey, false);
  const innerHash = JSON.stringify({ kind, ...innerJson });
  json3 = possiblyCollapse(json3, impl.collapsibleKey, false);
  const collapsibleJson = possiblyCollapse(json3, impl.collapsibleKey, true);
  const hash = JSON.stringify({ kind, ...json3 });
  if ($.nodesByHash[hash] && !ignoreCache)
    return $.nodesByHash[hash];
  const attachments = {
    id,
    kind,
    impl,
    inner,
    innerEntries,
    innerJson,
    innerHash,
    meta,
    metaJson,
    json: json3,
    hash,
    collapsibleJson,
    children
  };
  if (kind !== "intersection") {
    for (const k in inner)
      if (k !== "in" && k !== "out")
        attachments[k] = inner[k];
  }
  const node2 = new nodeClassesByKind[kind](attachments, $);
  return $.nodesByHash[hash] = node2;
};
var withId = (node2, id) => {
  if (node2.id === id)
    return node2;
  if (isNode(nodesByRegisteredId[id]))
    throwInternalError(`Unexpected attempt to overwrite node id ${id}`);
  return createNode({
    id,
    kind: node2.kind,
    inner: node2.inner,
    meta: node2.meta,
    $: node2.$,
    ignoreCache: true
  });
};
var withMeta = (node2, meta, id) => {
  if (id && isNode(nodesByRegisteredId[id]))
    throwInternalError(`Unexpected attempt to overwrite node id ${id}`);
  return createNode({
    id: id ?? registerNodeId(meta.alias ?? node2.kind),
    kind: node2.kind,
    inner: node2.inner,
    meta,
    $: node2.$
  });
};
var possiblyCollapse = (json3, toKey, allowPrimitive) => {
  const collapsibleKeys = Object.keys(json3);
  if (collapsibleKeys.length === 1 && collapsibleKeys[0] === toKey) {
    const collapsed = json3[toKey];
    if (allowPrimitive)
      return collapsed;
    if (
      // if the collapsed value is still an object
      hasDomain(collapsed, "object") && // and the JSON did not include any implied keys
      (Object.keys(collapsed).length === 1 || Array.isArray(collapsed))
    ) {
      return collapsed;
    }
  }
  return json3;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/prop.js
var intersectProps = (l, r, ctx) => {
  if (l.key !== r.key)
    return null;
  const key = l.key;
  let value2 = intersectOrPipeNodes(l.value, r.value, ctx);
  const kind = l.required || r.required ? "required" : "optional";
  if (value2 instanceof Disjoint) {
    if (kind === "optional")
      value2 = $ark.intrinsic.never.internal;
    else {
      return value2.withPrefixKey(l.key, l.required && r.required ? "required" : "optional");
    }
  }
  if (kind === "required") {
    return ctx.$.node("required", {
      key,
      value: value2
    });
  }
  const defaultIntersection = l.hasDefault() ? r.hasDefault() ? l.default === r.default ? l.default : throwParseError(writeDefaultIntersectionMessage(l.default, r.default)) : l.default : r.hasDefault() ? r.default : unset;
  return ctx.$.node("optional", {
    key,
    value: value2,
    // unset is stripped during parsing
    default: defaultIntersection
  });
};
var BaseProp = class extends BaseConstraint {
  required = this.kind === "required";
  optional = this.kind === "optional";
  impliedBasis = $ark.intrinsic.object.internal;
  serializedKey = compileSerializedValue(this.key);
  compiledKey = typeof this.key === "string" ? this.key : this.serializedKey;
  flatRefs = append(this.value.flatRefs.map((ref) => flatRef([this.key, ...ref.path], ref.node)), flatRef([this.key], this.value));
  _transform(mapper, ctx) {
    ctx.path.push(this.key);
    const result = super._transform(mapper, ctx);
    ctx.path.pop();
    return result;
  }
  hasDefault() {
    return "default" in this.inner;
  }
  traverseAllows = (data, ctx) => {
    if (this.key in data) {
      return traverseKey(this.key, () => this.value.traverseAllows(data[this.key], ctx), ctx);
    }
    return this.optional;
  };
  traverseApply = (data, ctx) => {
    if (this.key in data) {
      traverseKey(this.key, () => this.value.traverseApply(data[this.key], ctx), ctx);
    } else if (this.hasKind("required"))
      ctx.errorFromNodeContext(this.errorContext);
  };
  compile(js) {
    js.if(`${this.serializedKey} in data`, () => js.traverseKey(this.serializedKey, `data${js.prop(this.key)}`, this.value));
    if (this.hasKind("required")) {
      js.else(() => js.traversalKind === "Apply" ? js.line(`ctx.errorFromNodeContext(${this.compiledErrorContext})`) : js.return(false));
    }
    if (js.traversalKind === "Allows")
      js.return(true);
  }
};
var writeDefaultIntersectionMessage = (lValue, rValue) => `Invalid intersection of default values ${printable(lValue)} & ${printable(rValue)}`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/optional.js
var implementation11 = implementNode({
  kind: "optional",
  hasAssociatedError: false,
  intersectionIsOpen: true,
  keys: {
    key: {},
    value: {
      child: true,
      parse: (schema2, ctx) => ctx.$.parseSchema(schema2)
    },
    default: {
      preserveUndefined: true
    }
  },
  normalize: (schema2) => schema2,
  reduce: (inner, $) => {
    if ($.resolvedConfig.exactOptionalPropertyTypes === false) {
      if (!inner.value.allows(void 0)) {
        return $.node("optional", { ...inner, value: inner.value.or(intrinsic.undefined) }, { prereduced: true });
      }
    }
  },
  defaults: {
    description: (node2) => `${node2.compiledKey}?: ${node2.value.description}`
  },
  intersections: {
    optional: intersectProps
  }
});
var OptionalNode = class extends BaseProp {
  constructor(...args2) {
    super(...args2);
    if ("default" in this.inner)
      assertDefaultValueAssignability(this.value, this.inner.default, this.key);
  }
  get rawIn() {
    const baseIn = super.rawIn;
    if (!this.hasDefault())
      return baseIn;
    return this.$.node("optional", omit(baseIn.inner, { default: true }), {
      prereduced: true
    });
  }
  get outProp() {
    if (!this.hasDefault())
      return this;
    const { default: defaultValue, ...requiredInner } = this.inner;
    return this.cacheGetter("outProp", this.$.node("required", requiredInner, { prereduced: true }));
  }
  expression = this.hasDefault() ? `${this.compiledKey}: ${this.value.expression} = ${printable(this.inner.default)}` : `${this.compiledKey}?: ${this.value.expression}`;
  defaultValueMorph = getDefaultableMorph(this);
  defaultValueMorphRef = this.defaultValueMorph && registeredReference(this.defaultValueMorph);
};
var Optional = {
  implementation: implementation11,
  Node: OptionalNode
};
var defaultableMorphCache = {};
var getDefaultableMorph = (node2) => {
  if (!node2.hasDefault())
    return;
  const cacheKey = `{${node2.compiledKey}: ${node2.value.id} = ${defaultValueSerializer(node2.default)}}`;
  return defaultableMorphCache[cacheKey] ??= computeDefaultValueMorph(node2.key, node2.value, node2.default);
};
var computeDefaultValueMorph = (key, value2, defaultInput) => {
  if (typeof defaultInput === "function") {
    return value2.includesTransform ? (data, ctx) => {
      traverseKey(key, () => value2(data[key] = defaultInput(), ctx), ctx);
      return data;
    } : (data) => {
      data[key] = defaultInput();
      return data;
    };
  }
  const precomputedMorphedDefault = value2.includesTransform ? value2.assert(defaultInput) : defaultInput;
  return hasDomain(precomputedMorphedDefault, "object") ? (
    // the type signature only allows this if the value was morphed
    (data, ctx) => {
      traverseKey(key, () => value2(data[key] = defaultInput, ctx), ctx);
      return data;
    }
  ) : (data) => {
    data[key] = precomputedMorphedDefault;
    return data;
  };
};
var assertDefaultValueAssignability = (node2, value2, key) => {
  const wrapped = isThunk(value2);
  if (hasDomain(value2, "object") && !wrapped)
    throwParseError(writeNonPrimitiveNonFunctionDefaultValueMessage(key));
  const out = node2.in(wrapped ? value2() : value2);
  if (out instanceof ArkErrors) {
    if (key === null) {
      throwParseError(`Default ${out.summary}`);
    }
    const atPath = out.transform((e) => e.transform((input2) => ({ ...input2, prefixPath: [key] })));
    throwParseError(`Default for ${atPath.summary}`);
  }
  return value2;
};
var writeNonPrimitiveNonFunctionDefaultValueMessage = (key) => {
  const keyDescription = key === null ? "" : typeof key === "number" ? `for value at [${key}] ` : `for ${compileSerializedValue(key)} `;
  return `Non-primitive default ${keyDescription}must be specified as a function like () => ({my: 'object'})`;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/root.js
var BaseRoot = class extends BaseNode {
  constructor(attachments, $) {
    super(attachments, $);
    Object.defineProperty(this, arkKind, { value: "root", enumerable: false });
  }
  // doesn't seem possible to override this at a type-level (e.g. via declare)
  // without TS complaining about getters
  get rawIn() {
    return super.rawIn;
  }
  get rawOut() {
    return super.rawOut;
  }
  get internal() {
    return this;
  }
  get "~standard"() {
    return {
      vendor: "arktype",
      version: 1,
      validate: (input2) => {
        const out = this(input2);
        if (out instanceof ArkErrors)
          return out;
        return { value: out };
      },
      jsonSchema: {
        input: (opts) => toStandardJsonSchema(this.rawIn, opts),
        output: (opts) => toStandardJsonSchema(this.rawOut, opts)
      }
    };
  }
  as() {
    return this;
  }
  brand(name) {
    if (name === "")
      return throwParseError(emptyBrandNameMessage);
    return this;
  }
  readonly() {
    return this;
  }
  branches = this.hasKind("union") ? this.inner.branches : [this];
  distribute(mapBranch, reduceMapped) {
    const mappedBranches = this.branches.map(mapBranch);
    return reduceMapped?.(mappedBranches) ?? mappedBranches;
  }
  get shortDescription() {
    return this.meta.description ?? this.defaultShortDescription;
  }
  toJsonSchema(opts = {}) {
    const ctx = mergeToJsonSchemaConfigs(this.$.resolvedConfig.toJsonSchema, opts);
    ctx.useRefs ||= this.isCyclic;
    if (ctx.useRefs)
      ctx.refs = /* @__PURE__ */ new Map();
    const schema2 = typeof ctx.dialect === "string" ? { $schema: ctx.dialect } : {};
    Object.assign(schema2, this.toJsonSchemaRecurse(ctx));
    if (ctx.refs) {
      const defs = {};
      for (const [id, ref] of ctx.refs)
        defs[id] = ref.toResolvedJsonSchema(ctx);
      if (ctx.target === "draft-07")
        Object.assign(schema2, { definitions: defs });
      else
        schema2.$defs = defs;
    }
    return schema2;
  }
  toJsonSchemaRecurse(ctx) {
    if (ctx.useRefs && !this.alwaysExpandJsonSchema) {
      const defsKey = ctx.target === "draft-07" ? "definitions" : "$defs";
      ctx.refs?.set(this.id, this);
      return { $ref: `#/${defsKey}/${this.id}` };
    }
    return this.toResolvedJsonSchema(ctx);
  }
  get alwaysExpandJsonSchema() {
    return this.isBasis() || this.kind === "alias" || this.hasKind("union") && this.isBoolean;
  }
  toResolvedJsonSchema(ctx) {
    const result = this.innerToJsonSchema(ctx);
    for (const k in this.meta) {
      const v = this.meta[k];
      const jsonValue = typeof v !== "function" && $ark.intrinsic.jsonData.allows(v) ? v : k === "default" ? ctx.fallback.defaultValue({
        code: "defaultValue",
        base: result,
        value: v
      }) : this.metaJson[k];
      if (jsonValue !== void 0)
        result[k] = jsonValue;
    }
    return result;
  }
  intersect(r) {
    const rNode = this.$.parseDefinition(r);
    const result = this.rawIntersect(rNode);
    if (result instanceof Disjoint)
      return result;
    return this.$.finalize(result);
  }
  rawIntersect(r) {
    return intersectNodesRoot(this, r, this.$);
  }
  toNeverIfDisjoint() {
    return this;
  }
  and(r) {
    const result = this.intersect(r);
    return result instanceof Disjoint ? result.throw() : result;
  }
  rawAnd(r) {
    const result = this.rawIntersect(r);
    return result instanceof Disjoint ? result.throw() : result;
  }
  or(r) {
    const rNode = this.$.parseDefinition(r);
    return this.$.finalize(this.rawOr(rNode));
  }
  rawOr(r) {
    const branches = [...this.branches, ...r.branches];
    return this.$.node("union", branches);
  }
  map(flatMapEntry) {
    return this.$.schema(this.applyStructuralOperation("map", [flatMapEntry]));
  }
  pick(...keys) {
    return this.$.schema(this.applyStructuralOperation("pick", keys));
  }
  omit(...keys) {
    return this.$.schema(this.applyStructuralOperation("omit", keys));
  }
  required() {
    return this.$.schema(this.applyStructuralOperation("required", []));
  }
  partial() {
    return this.$.schema(this.applyStructuralOperation("partial", []));
  }
  _keyof;
  keyof() {
    if (this._keyof)
      return this._keyof;
    const result = this.applyStructuralOperation("keyof", []).reduce((result2, branch) => result2.intersect(branch).toNeverIfDisjoint(), $ark.intrinsic.unknown.internal);
    if (result.branches.length === 0) {
      throwParseError(writeUnsatisfiableExpressionError(`keyof ${this.expression}`));
    }
    return this._keyof = this.$.finalize(result);
  }
  get props() {
    if (this.branches.length !== 1)
      return throwParseError(writeLiteralUnionEntriesMessage(this.expression));
    return [...this.applyStructuralOperation("props", [])[0]];
  }
  merge(r) {
    const rNode = this.$.parseDefinition(r);
    return this.$.schema(rNode.distribute((branch) => this.applyStructuralOperation("merge", [
      structureOf(branch) ?? throwParseError(writeNonStructuralOperandMessage("merge", branch.expression))
    ])));
  }
  applyStructuralOperation(operation, args2) {
    return this.distribute((branch) => {
      if (branch.equals($ark.intrinsic.object) && operation !== "merge" && operation !== "props")
        return branch;
      const structure = structureOf(branch);
      if (!structure) {
        throwParseError(writeNonStructuralOperandMessage(operation, branch.expression));
      }
      if (operation === "keyof")
        return structure.keyof();
      if (operation === "get")
        return structure.get(...args2);
      if (operation === "props")
        return structure.props;
      const structuralMethodName = operation === "required" ? "require" : operation === "partial" ? "optionalize" : operation;
      const transformed = structure[structuralMethodName](...args2);
      const isHomomorphic = operation === "required" || operation === "partial";
      if (isHomomorphic && transformed.equals(structure))
        return branch;
      return this.$.node("intersection", {
        ...isHomomorphic && transformed.sequence ? { proto: Array } : { domain: "object" },
        structure: transformed
      });
    });
  }
  get(...path) {
    if (path[0] === void 0)
      return this;
    return this.$.schema(this.applyStructuralOperation("get", path));
  }
  extract(r) {
    const rNode = this.$.parseDefinition(r);
    return this.$.schema(this.branches.filter((branch) => branch.extends(rNode)));
  }
  exclude(r) {
    const rNode = this.$.parseDefinition(r);
    return this.$.schema(this.branches.filter((branch) => !branch.extends(rNode)));
  }
  array() {
    return this.$.finalize(this.rawArray());
  }
  rawArray() {
    return this.$.parseSchema(this.isUnknown() ? { proto: Array } : {
      proto: Array,
      sequence: this
    }, { prereduced: true });
  }
  overlaps(r) {
    const intersection = this.intersect(r);
    return !(intersection instanceof Disjoint);
  }
  extends(r) {
    if (this.isNever())
      return true;
    const intersection = this.intersect(r);
    return !(intersection instanceof Disjoint) && this.equals(intersection);
  }
  ifExtends(r) {
    return this.extends(r) ? this : void 0;
  }
  subsumes(r) {
    const rNode = this.$.parseDefinition(r);
    return rNode.extends(this);
  }
  configure(meta, selector = "shallow") {
    return this.configureReferences(meta, selector);
  }
  describe(description, selector = "shallow") {
    return this.configure({ description }, selector);
  }
  // these should ideally be implemented in arktype since they use its syntax
  // https://github.com/arktypeio/arktype/issues/1223
  optional() {
    return [this, "?"];
  }
  // these should ideally be implemented in arktype since they use its syntax
  // https://github.com/arktypeio/arktype/issues/1223
  default(thunkableValue) {
    assertDefaultValueAssignability(this, thunkableValue, null);
    return [this, "=", thunkableValue];
  }
  from(input2) {
    return this.assert(input2);
  }
  _pipe(...morphs) {
    const result = morphs.reduce((acc, morph) => acc.rawPipeOnce(morph), this);
    return this.$.finalize(result);
  }
  tryPipe(...morphs) {
    const result = morphs.reduce((acc, morph) => acc.rawPipeOnce(hasArkKind(morph, "root") ? morph : ((In, ctx) => {
      try {
        return morph(In, ctx);
      } catch (e) {
        return ctx.error({
          code: "predicate",
          predicate: morph,
          actual: `aborted due to error:
    ${e}
`
        });
      }
    })), this);
    return this.$.finalize(result);
  }
  pipe = Object.assign(this._pipe.bind(this), {
    try: this.tryPipe.bind(this)
  });
  to(def) {
    return this.$.finalize(this.toNode(this.$.parseDefinition(def)));
  }
  toNode(root) {
    const result = pipeNodesRoot(this, root, this.$);
    if (result instanceof Disjoint)
      return result.throw();
    return result;
  }
  rawPipeOnce(morph) {
    if (hasArkKind(morph, "root"))
      return this.toNode(morph);
    return this.distribute((branch) => branch.hasKind("morph") ? this.$.node("morph", {
      in: branch.inner.in,
      morphs: [...branch.morphs, morph]
    }) : this.$.node("morph", {
      in: branch,
      morphs: [morph]
    }), this.$.parseSchema);
  }
  narrow(predicate) {
    return this.constrainOut("predicate", predicate);
  }
  constrain(kind, schema2) {
    return this._constrain("root", kind, schema2);
  }
  constrainIn(kind, schema2) {
    return this._constrain("in", kind, schema2);
  }
  constrainOut(kind, schema2) {
    return this._constrain("out", kind, schema2);
  }
  _constrain(io, kind, schema2) {
    const constraint = this.$.node(kind, schema2);
    if (constraint.isRoot()) {
      return constraint.isUnknown() ? this : throwInternalError(`Unexpected constraint node ${constraint}`);
    }
    const operand = io === "root" ? this : io === "in" ? this.rawIn : this.rawOut;
    if (operand.hasKind("morph") || constraint.impliedBasis && !operand.extends(constraint.impliedBasis)) {
      return throwInvalidOperandError(kind, constraint.impliedBasis, this);
    }
    const partialIntersection = this.$.node("intersection", {
      // important this is constraint.kind instead of kind in case
      // the node was reduced during parsing
      [constraint.kind]: constraint
    });
    const result = io === "out" ? pipeNodesRoot(this, partialIntersection, this.$) : intersectNodesRoot(this, partialIntersection, this.$);
    if (result instanceof Disjoint)
      result.throw();
    return this.$.finalize(result);
  }
  onUndeclaredKey(cfg) {
    const rule = typeof cfg === "string" ? cfg : cfg.rule;
    const deep = typeof cfg === "string" ? false : cfg.deep;
    return this.$.finalize(this.transform((kind, inner) => kind === "structure" ? rule === "ignore" ? omit(inner, { undeclared: 1 }) : { ...inner, undeclared: rule } : inner, deep ? void 0 : { shouldTransform: (node2) => !includes(structuralKinds, node2.kind) }));
  }
  hasEqualMorphs(r) {
    if (!this.includesTransform && !r.includesTransform)
      return true;
    if (!arrayEquals(this.shallowMorphs, r.shallowMorphs))
      return false;
    if (!arrayEquals(this.flatMorphs, r.flatMorphs, {
      isEqual: (l, r2) => l.propString === r2.propString && (l.node.hasKind("morph") && r2.node.hasKind("morph") ? l.node.hasEqualMorphs(r2.node) : l.node.hasKind("intersection") && r2.node.hasKind("intersection") ? l.node.structure?.structuralMorphRef === r2.node.structure?.structuralMorphRef : false)
    }))
      return false;
    return true;
  }
  onDeepUndeclaredKey(behavior) {
    return this.onUndeclaredKey({ rule: behavior, deep: true });
  }
  filter(predicate) {
    return this.constrainIn("predicate", predicate);
  }
  divisibleBy(schema2) {
    return this.constrain("divisor", schema2);
  }
  matching(schema2) {
    return this.constrain("pattern", schema2);
  }
  atLeast(schema2) {
    return this.constrain("min", schema2);
  }
  atMost(schema2) {
    return this.constrain("max", schema2);
  }
  moreThan(schema2) {
    return this.constrain("min", exclusivizeRangeSchema(schema2));
  }
  lessThan(schema2) {
    return this.constrain("max", exclusivizeRangeSchema(schema2));
  }
  atLeastLength(schema2) {
    return this.constrain("minLength", schema2);
  }
  atMostLength(schema2) {
    return this.constrain("maxLength", schema2);
  }
  moreThanLength(schema2) {
    return this.constrain("minLength", exclusivizeRangeSchema(schema2));
  }
  lessThanLength(schema2) {
    return this.constrain("maxLength", exclusivizeRangeSchema(schema2));
  }
  exactlyLength(schema2) {
    return this.constrain("exactLength", schema2);
  }
  atOrAfter(schema2) {
    return this.constrain("after", schema2);
  }
  atOrBefore(schema2) {
    return this.constrain("before", schema2);
  }
  laterThan(schema2) {
    return this.constrain("after", exclusivizeRangeSchema(schema2));
  }
  earlierThan(schema2) {
    return this.constrain("before", exclusivizeRangeSchema(schema2));
  }
};
var emptyBrandNameMessage = `Expected a non-empty brand name after #`;
var supportedJsonSchemaTargets = [
  "draft-2020-12",
  "draft-07"
];
var writeInvalidJsonSchemaTargetMessage = (target) => `JSONSchema target '${target}' is not supported (must be ${supportedJsonSchemaTargets.map((t) => `"${t}"`).join(" or ")})`;
var validateStandardJsonSchemaTarget = (target) => {
  if (!includes(supportedJsonSchemaTargets, target))
    throwParseError(writeInvalidJsonSchemaTargetMessage(target));
  return target;
};
var toStandardJsonSchema = (node2, opts) => {
  const ctx = mergeToJsonSchemaConfigs(node2.$.resolvedConfig.toJsonSchema, {
    target: validateStandardJsonSchemaTarget(opts.target),
    ...opts.libraryOptions
  });
  const fallback = flatMorph(ctx.fallback, (code, handler) => [
    code,
    handler === ToJsonSchema.defaultConfig.fallback[code] ? ToJsonSchema.standardFallback[code] : handler
  ]);
  return node2.toJsonSchema({ ...ctx, fallback });
};
var exclusivizeRangeSchema = (schema2) => typeof schema2 === "object" && !(schema2 instanceof Date) ? { ...schema2, exclusive: true } : {
  rule: schema2,
  exclusive: true
};
var typeOrTermExtends = (t, base) => hasArkKind(base, "root") ? hasArkKind(t, "root") ? t.extends(base) : base.allows(t) : hasArkKind(t, "root") ? t.hasUnit(base) : base === t;
var structureOf = (branch) => {
  if (branch.hasKind("morph"))
    return null;
  if (branch.hasKind("intersection")) {
    return branch.inner.structure ?? (branch.basis?.domain === "object" ? branch.$.bindReference($ark.intrinsic.emptyStructure) : null);
  }
  if (branch.isBasis() && branch.domain === "object")
    return branch.$.bindReference($ark.intrinsic.emptyStructure);
  return null;
};
var writeLiteralUnionEntriesMessage = (expression) => `Props cannot be extracted from a union. Use .distribute to extract props from each branch instead. Received:
${expression}`;
var writeNonStructuralOperandMessage = (operation, operand) => `${operation} operand must be an object (was ${operand})`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/utils.js
var defineRightwardIntersections = (kind, implementation23) => flatMorph(schemaKindsRightOf(kind), (i, kind2) => [
  kind2,
  implementation23
]);

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/alias.js
var normalizeAliasSchema = (schema2) => typeof schema2 === "string" ? { reference: schema2 } : schema2;
var neverIfDisjoint = (result) => result instanceof Disjoint ? $ark.intrinsic.never.internal : result;
var implementation12 = implementNode({
  kind: "alias",
  hasAssociatedError: false,
  collapsibleKey: "reference",
  keys: {
    reference: {
      serialize: (s) => s.startsWith("$") ? s : `$ark.${s}`
    },
    resolve: {}
  },
  normalize: normalizeAliasSchema,
  defaults: {
    description: (node2) => node2.reference
  },
  intersections: {
    alias: (l, r, ctx) => ctx.$.lazilyResolve(() => neverIfDisjoint(intersectOrPipeNodes(l.resolution, r.resolution, ctx)), `${l.reference}${ctx.pipe ? "=>" : "&"}${r.reference}`),
    ...defineRightwardIntersections("alias", (l, r, ctx) => {
      if (r.isUnknown())
        return l;
      if (r.isNever())
        return r;
      if (r.isBasis() && !r.overlaps($ark.intrinsic.object)) {
        return Disjoint.init("assignability", $ark.intrinsic.object, r);
      }
      return ctx.$.lazilyResolve(() => neverIfDisjoint(intersectOrPipeNodes(l.resolution, r, ctx)), `${l.reference}${ctx.pipe ? "=>" : "&"}${r.id}`);
    })
  }
});
var AliasNode = class extends BaseRoot {
  expression = this.reference;
  structure = void 0;
  get resolution() {
    const result = this._resolve();
    return nodesByRegisteredId[this.id] = result;
  }
  _resolve() {
    if (this.resolve)
      return this.resolve();
    if (this.reference[0] === "$")
      return this.$.resolveRoot(this.reference.slice(1));
    const id = this.reference;
    let resolution = nodesByRegisteredId[id];
    const seen = [];
    while (hasArkKind(resolution, "context")) {
      if (seen.includes(resolution.id)) {
        return throwParseError(writeShallowCycleErrorMessage(resolution.id, seen));
      }
      seen.push(resolution.id);
      resolution = nodesByRegisteredId[resolution.id];
    }
    if (!hasArkKind(resolution, "root")) {
      return throwInternalError(`Unexpected resolution for reference ${this.reference}
Seen: [${seen.join("->")}] 
Resolution: ${printable(resolution)}`);
    }
    return resolution;
  }
  get resolutionId() {
    if (this.reference.includes("&") || this.reference.includes("=>"))
      return this.resolution.id;
    if (this.reference[0] !== "$")
      return this.reference;
    const alias = this.reference.slice(1);
    const resolution = this.$.resolutions[alias];
    if (typeof resolution === "string")
      return resolution;
    if (hasArkKind(resolution, "root"))
      return resolution.id;
    return throwInternalError(`Unexpected resolution for reference ${this.reference}: ${printable(resolution)}`);
  }
  get defaultShortDescription() {
    return domainDescriptions.object;
  }
  innerToJsonSchema(ctx) {
    return this.resolution.toJsonSchemaRecurse(ctx);
  }
  traverseAllows = (data, ctx) => {
    const seen = ctx.seen[this.reference];
    if (seen?.includes(data))
      return true;
    ctx.seen[this.reference] = append(seen, data);
    return this.resolution.traverseAllows(data, ctx);
  };
  traverseApply = (data, ctx) => {
    const seen = ctx.seen[this.reference];
    if (seen?.includes(data))
      return;
    ctx.seen[this.reference] = append(seen, data);
    this.resolution.traverseApply(data, ctx);
  };
  compile(js) {
    const id = this.resolutionId;
    js.if(`ctx.seen.${id} && ctx.seen.${id}.includes(data)`, () => js.return(true));
    js.if(`!ctx.seen.${id}`, () => js.line(`ctx.seen.${id} = []`));
    js.line(`ctx.seen.${id}.push(data)`);
    js.return(js.invoke(id));
  }
};
var writeShallowCycleErrorMessage = (name, seen) => `Alias '${name}' has a shallow resolution cycle: ${[...seen, name].join("->")}`;
var Alias = {
  implementation: implementation12,
  Node: AliasNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/basis.js
var InternalBasis = class extends BaseRoot {
  traverseApply = (data, ctx) => {
    if (!this.traverseAllows(data, ctx))
      ctx.errorFromNodeContext(this.errorContext);
  };
  get errorContext() {
    return {
      code: this.kind,
      description: this.description,
      meta: this.meta,
      ...this.inner
    };
  }
  get compiledErrorContext() {
    return compileObjectLiteral(this.errorContext);
  }
  compile(js) {
    if (js.traversalKind === "Allows")
      js.return(this.compiledCondition);
    else {
      js.if(this.compiledNegation, () => js.line(`ctx.errorFromNodeContext(${this.compiledErrorContext})`));
    }
  }
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/domain.js
var implementation13 = implementNode({
  kind: "domain",
  hasAssociatedError: true,
  collapsibleKey: "domain",
  keys: {
    domain: {},
    numberAllowsNaN: {}
  },
  normalize: (schema2) => typeof schema2 === "string" ? { domain: schema2 } : hasKey(schema2, "numberAllowsNaN") && schema2.domain !== "number" ? throwParseError(Domain.writeBadAllowNanMessage(schema2.domain)) : schema2,
  applyConfig: (schema2, config) => schema2.numberAllowsNaN === void 0 && schema2.domain === "number" && config.numberAllowsNaN ? { ...schema2, numberAllowsNaN: true } : schema2,
  defaults: {
    description: (node2) => domainDescriptions[node2.domain],
    actual: (data) => Number.isNaN(data) ? "NaN" : domainDescriptions[domainOf(data)]
  },
  intersections: {
    domain: (l, r) => (
      // since l === r is handled by default, remaining cases are disjoint
      // outside those including options like numberAllowsNaN
      l.domain === "number" && r.domain === "number" ? l.numberAllowsNaN ? r : l : Disjoint.init("domain", l, r)
    )
  }
});
var DomainNode = class extends InternalBasis {
  requiresNaNCheck = this.domain === "number" && !this.numberAllowsNaN;
  traverseAllows = this.requiresNaNCheck ? (data) => typeof data === "number" && !Number.isNaN(data) : (data) => domainOf(data) === this.domain;
  compiledCondition = this.domain === "object" ? `((typeof data === "object" && data !== null) || typeof data === "function")` : `typeof data === "${this.domain}"${this.requiresNaNCheck ? " && !Number.isNaN(data)" : ""}`;
  compiledNegation = this.domain === "object" ? `((typeof data !== "object" || data === null) && typeof data !== "function")` : `typeof data !== "${this.domain}"${this.requiresNaNCheck ? " || Number.isNaN(data)" : ""}`;
  expression = this.numberAllowsNaN ? "number | NaN" : this.domain;
  get nestableExpression() {
    return this.numberAllowsNaN ? `(${this.expression})` : this.expression;
  }
  get defaultShortDescription() {
    return domainDescriptions[this.domain];
  }
  innerToJsonSchema(ctx) {
    if (this.domain === "bigint" || this.domain === "symbol") {
      return ctx.fallback.domain({
        code: "domain",
        base: {},
        domain: this.domain
      });
    }
    return {
      type: this.domain
    };
  }
};
var Domain = {
  implementation: implementation13,
  Node: DomainNode,
  writeBadAllowNanMessage: (actual) => `numberAllowsNaN may only be specified with domain "number" (was ${actual})`
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/intersection.js
var implementation14 = implementNode({
  kind: "intersection",
  hasAssociatedError: true,
  normalize: (rawSchema) => {
    if (isNode(rawSchema))
      return rawSchema;
    const { structure, ...schema2 } = rawSchema;
    const hasRootStructureKey = !!structure;
    const normalizedStructure = structure ?? {};
    const normalized = flatMorph(schema2, (k, v) => {
      if (isKeyOf(k, structureKeys)) {
        if (hasRootStructureKey) {
          throwParseError(`Flattened structure key ${k} cannot be specified alongside a root 'structure' key.`);
        }
        normalizedStructure[k] = v;
        return [];
      }
      return [k, v];
    });
    if (hasArkKind(normalizedStructure, "constraint") || !isEmptyObject(normalizedStructure))
      normalized.structure = normalizedStructure;
    return normalized;
  },
  finalizeInnerJson: ({ structure, ...rest }) => hasDomain(structure, "object") ? { ...structure, ...rest } : rest,
  keys: {
    domain: {
      child: true,
      parse: (schema2, ctx) => ctx.$.node("domain", schema2)
    },
    proto: {
      child: true,
      parse: (schema2, ctx) => ctx.$.node("proto", schema2)
    },
    structure: {
      child: true,
      parse: (schema2, ctx) => ctx.$.node("structure", schema2),
      serialize: (node2) => {
        if (!node2.sequence?.minLength)
          return node2.collapsibleJson;
        const { sequence, ...structureJson } = node2.collapsibleJson;
        const { minVariadicLength, ...sequenceJson } = sequence;
        const collapsibleSequenceJson = sequenceJson.variadic && Object.keys(sequenceJson).length === 1 ? sequenceJson.variadic : sequenceJson;
        return { ...structureJson, sequence: collapsibleSequenceJson };
      }
    },
    divisor: {
      child: true,
      parse: constraintKeyParser("divisor")
    },
    max: {
      child: true,
      parse: constraintKeyParser("max")
    },
    min: {
      child: true,
      parse: constraintKeyParser("min")
    },
    maxLength: {
      child: true,
      parse: constraintKeyParser("maxLength")
    },
    minLength: {
      child: true,
      parse: constraintKeyParser("minLength")
    },
    exactLength: {
      child: true,
      parse: constraintKeyParser("exactLength")
    },
    before: {
      child: true,
      parse: constraintKeyParser("before")
    },
    after: {
      child: true,
      parse: constraintKeyParser("after")
    },
    pattern: {
      child: true,
      parse: constraintKeyParser("pattern")
    },
    predicate: {
      child: true,
      parse: constraintKeyParser("predicate")
    }
  },
  // leverage reduction logic from intersection and identity to ensure initial
  // parse result is reduced
  reduce: (inner, $) => (
    // we cast union out of the result here since that only occurs when intersecting two sequences
    // that cannot occur when reducing a single intersection schema using unknown
    intersectIntersections({}, inner, {
      $,
      invert: false,
      pipe: false
    })
  ),
  defaults: {
    description: (node2) => {
      if (node2.children.length === 0)
        return "unknown";
      if (node2.structure)
        return node2.structure.description;
      const childDescriptions = [];
      if (node2.basis && !node2.prestructurals.some((r) => r.impl.obviatesBasisDescription))
        childDescriptions.push(node2.basis.description);
      if (node2.prestructurals.length) {
        const sortedRefinementDescriptions = node2.prestructurals.slice().sort((l, r) => l.kind === "min" && r.kind === "max" ? -1 : 0).map((r) => r.description);
        childDescriptions.push(...sortedRefinementDescriptions);
      }
      if (node2.inner.predicate) {
        childDescriptions.push(...node2.inner.predicate.map((p) => p.description));
      }
      return childDescriptions.join(" and ");
    },
    expected: (source) => `  \u25E6 ${source.errors.map((e) => e.expected).join("\n  \u25E6 ")}`,
    problem: (ctx) => `(${ctx.actual}) must be...
${ctx.expected}`
  },
  intersections: {
    intersection: (l, r, ctx) => intersectIntersections(l.inner, r.inner, ctx),
    ...defineRightwardIntersections("intersection", (l, r, ctx) => {
      if (l.children.length === 0)
        return r;
      const { domain, proto, ...lInnerConstraints } = l.inner;
      const lBasis = proto ?? domain;
      const basis = lBasis ? intersectOrPipeNodes(lBasis, r, ctx) : r;
      return basis instanceof Disjoint ? basis : l?.basis?.equals(basis) ? (
        // if the basis doesn't change, return the original intesection
        l
      ) : l.$.node("intersection", { ...lInnerConstraints, [basis.kind]: basis }, { prereduced: true });
    })
  }
});
var IntersectionNode = class extends BaseRoot {
  basis = this.inner.domain ?? this.inner.proto ?? null;
  prestructurals = [];
  refinements = this.children.filter((node2) => {
    if (!node2.isRefinement())
      return false;
    if (includes(prestructuralKinds, node2.kind))
      this.prestructurals.push(node2);
    return true;
  });
  structure = this.inner.structure;
  expression = writeIntersectionExpression(this);
  get shallowMorphs() {
    return this.inner.structure?.structuralMorph ? [this.inner.structure.structuralMorph] : [];
  }
  get defaultShortDescription() {
    return this.basis?.defaultShortDescription ?? "present";
  }
  innerToJsonSchema(ctx) {
    return this.children.reduce(
      // cast is required since TS doesn't know children have compatible schema prerequisites
      (schema2, child) => child.isBasis() ? child.toJsonSchemaRecurse(ctx) : child.reduceJsonSchema(schema2, ctx),
      {}
    );
  }
  traverseAllows = (data, ctx) => this.children.every((child) => child.traverseAllows(data, ctx));
  traverseApply = (data, ctx) => {
    const errorCount = ctx.currentErrorCount;
    if (this.basis) {
      this.basis.traverseApply(data, ctx);
      if (ctx.currentErrorCount > errorCount)
        return;
    }
    if (this.prestructurals.length) {
      for (let i = 0; i < this.prestructurals.length - 1; i++) {
        this.prestructurals[i].traverseApply(data, ctx);
        if (ctx.failFast && ctx.currentErrorCount > errorCount)
          return;
      }
      this.prestructurals[this.prestructurals.length - 1].traverseApply(data, ctx);
      if (ctx.currentErrorCount > errorCount)
        return;
    }
    if (this.structure) {
      this.structure.traverseApply(data, ctx);
      if (ctx.currentErrorCount > errorCount)
        return;
    }
    if (this.inner.predicate) {
      for (let i = 0; i < this.inner.predicate.length - 1; i++) {
        this.inner.predicate[i].traverseApply(data, ctx);
        if (ctx.failFast && ctx.currentErrorCount > errorCount)
          return;
      }
      this.inner.predicate[this.inner.predicate.length - 1].traverseApply(data, ctx);
    }
  };
  compile(js) {
    if (js.traversalKind === "Allows") {
      for (const child of this.children)
        js.check(child);
      js.return(true);
      return;
    }
    js.initializeErrorCount();
    if (this.basis) {
      js.check(this.basis);
      if (this.children.length > 1)
        js.returnIfFail();
    }
    if (this.prestructurals.length) {
      for (let i = 0; i < this.prestructurals.length - 1; i++) {
        js.check(this.prestructurals[i]);
        js.returnIfFailFast();
      }
      js.check(this.prestructurals[this.prestructurals.length - 1]);
      if (this.structure || this.inner.predicate)
        js.returnIfFail();
    }
    if (this.structure) {
      js.check(this.structure);
      if (this.inner.predicate)
        js.returnIfFail();
    }
    if (this.inner.predicate) {
      for (let i = 0; i < this.inner.predicate.length - 1; i++) {
        js.check(this.inner.predicate[i]);
        js.returnIfFail();
      }
      js.check(this.inner.predicate[this.inner.predicate.length - 1]);
    }
  }
};
var Intersection = {
  implementation: implementation14,
  Node: IntersectionNode
};
var writeIntersectionExpression = (node2) => {
  if (node2.structure?.expression)
    return node2.structure.expression;
  const basisExpression = node2.basis && !node2.prestructurals.some((n) => n.impl.obviatesBasisExpression) ? node2.basis.nestableExpression : "";
  const refinementsExpression = node2.prestructurals.map((n) => n.expression).join(" & ");
  const fullExpression = `${basisExpression}${basisExpression && refinementsExpression ? " " : ""}${refinementsExpression}`;
  if (fullExpression === "Array == 0")
    return "[]";
  return fullExpression || "unknown";
};
var intersectIntersections = (l, r, ctx) => {
  const baseInner = {};
  const lBasis = l.proto ?? l.domain;
  const rBasis = r.proto ?? r.domain;
  const basisResult = lBasis ? rBasis ? intersectOrPipeNodes(lBasis, rBasis, ctx) : lBasis : rBasis;
  if (basisResult instanceof Disjoint)
    return basisResult;
  if (basisResult)
    baseInner[basisResult.kind] = basisResult;
  return intersectConstraints({
    kind: "intersection",
    baseInner,
    l: flattenConstraints(l),
    r: flattenConstraints(r),
    roots: [],
    ctx
  });
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/morph.js
var implementation15 = implementNode({
  kind: "morph",
  hasAssociatedError: false,
  keys: {
    in: {
      child: true,
      parse: (schema2, ctx) => ctx.$.parseSchema(schema2)
    },
    morphs: {
      parse: liftArray,
      serialize: (morphs) => morphs.map((m) => hasArkKind(m, "root") ? m.json : registeredReference(m))
    },
    declaredIn: {
      child: false,
      serialize: (node2) => node2.json
    },
    declaredOut: {
      child: false,
      serialize: (node2) => node2.json
    }
  },
  normalize: (schema2) => schema2,
  defaults: {
    description: (node2) => `a morph from ${node2.rawIn.description} to ${node2.rawOut?.description ?? "unknown"}`
  },
  intersections: {
    morph: (l, r, ctx) => {
      if (!l.hasEqualMorphs(r)) {
        return throwParseError(writeMorphIntersectionMessage(l.expression, r.expression));
      }
      const inTersection = intersectOrPipeNodes(l.rawIn, r.rawIn, ctx);
      if (inTersection instanceof Disjoint)
        return inTersection;
      const baseInner = {
        morphs: l.morphs
      };
      if (l.declaredIn || r.declaredIn) {
        const declaredIn = intersectOrPipeNodes(l.rawIn, r.rawIn, ctx);
        if (declaredIn instanceof Disjoint)
          return declaredIn.throw();
        else
          baseInner.declaredIn = declaredIn;
      }
      if (l.declaredOut || r.declaredOut) {
        const declaredOut = intersectOrPipeNodes(l.rawOut, r.rawOut, ctx);
        if (declaredOut instanceof Disjoint)
          return declaredOut.throw();
        else
          baseInner.declaredOut = declaredOut;
      }
      return inTersection.distribute((inBranch) => ctx.$.node("morph", {
        ...baseInner,
        in: inBranch
      }), ctx.$.parseSchema);
    },
    ...defineRightwardIntersections("morph", (l, r, ctx) => {
      const inTersection = l.inner.in ? intersectOrPipeNodes(l.inner.in, r, ctx) : r;
      return inTersection instanceof Disjoint ? inTersection : inTersection.equals(l.inner.in) ? l : ctx.$.node("morph", {
        ...l.inner,
        in: inTersection
      });
    })
  }
});
var MorphNode = class extends BaseRoot {
  serializedMorphs = this.morphs.map(registeredReference);
  compiledMorphs = `[${this.serializedMorphs}]`;
  lastMorph = this.inner.morphs[this.inner.morphs.length - 1];
  lastMorphIfNode = hasArkKind(this.lastMorph, "root") ? this.lastMorph : void 0;
  introspectableIn = this.inner.in;
  introspectableOut = this.lastMorphIfNode ? Object.assign(this.referencesById, this.lastMorphIfNode.referencesById) && this.lastMorphIfNode.rawOut : void 0;
  get shallowMorphs() {
    return Array.isArray(this.inner.in?.shallowMorphs) ? [...this.inner.in.shallowMorphs, ...this.morphs] : this.morphs;
  }
  get rawIn() {
    return this.declaredIn ?? this.inner.in?.rawIn ?? $ark.intrinsic.unknown.internal;
  }
  get rawOut() {
    return this.declaredOut ?? this.introspectableOut ?? $ark.intrinsic.unknown.internal;
  }
  declareIn(declaredIn) {
    return this.$.node("morph", {
      ...this.inner,
      declaredIn
    });
  }
  declareOut(declaredOut) {
    return this.$.node("morph", {
      ...this.inner,
      declaredOut
    });
  }
  expression = `(In: ${this.rawIn.expression}) => ${this.lastMorphIfNode ? "To" : "Out"}<${this.rawOut.expression}>`;
  get defaultShortDescription() {
    return this.rawIn.meta.description ?? this.rawIn.defaultShortDescription;
  }
  innerToJsonSchema(ctx) {
    return ctx.fallback.morph({
      code: "morph",
      base: this.rawIn.toJsonSchemaRecurse(ctx),
      out: this.introspectableOut?.toJsonSchemaRecurse(ctx) ?? null
    });
  }
  compile(js) {
    if (js.traversalKind === "Allows") {
      if (!this.introspectableIn)
        return;
      js.return(js.invoke(this.introspectableIn));
      return;
    }
    if (this.introspectableIn)
      js.line(js.invoke(this.introspectableIn));
    js.line(`ctx.queueMorphs(${this.compiledMorphs})`);
  }
  traverseAllows = (data, ctx) => !this.introspectableIn || this.introspectableIn.traverseAllows(data, ctx);
  traverseApply = (data, ctx) => {
    if (this.introspectableIn)
      this.introspectableIn.traverseApply(data, ctx);
    ctx.queueMorphs(this.morphs);
  };
  /** Check if the morphs of r are equal to those of this node */
  hasEqualMorphs(r) {
    return arrayEquals(this.morphs, r.morphs, {
      isEqual: (lMorph, rMorph) => lMorph === rMorph || hasArkKind(lMorph, "root") && hasArkKind(rMorph, "root") && lMorph.equals(rMorph)
    });
  }
};
var Morph = {
  implementation: implementation15,
  Node: MorphNode
};
var writeMorphIntersectionMessage = (lDescription, rDescription) => `The intersection of distinct morphs at a single path is indeterminate:
Left: ${lDescription}
Right: ${rDescription}`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/proto.js
var implementation16 = implementNode({
  kind: "proto",
  hasAssociatedError: true,
  collapsibleKey: "proto",
  keys: {
    proto: {
      serialize: (ctor) => getBuiltinNameOfConstructor(ctor) ?? defaultValueSerializer(ctor)
    },
    dateAllowsInvalid: {}
  },
  normalize: (schema2) => {
    const normalized = typeof schema2 === "string" ? { proto: builtinConstructors[schema2] } : typeof schema2 === "function" ? isNode(schema2) ? schema2 : { proto: schema2 } : typeof schema2.proto === "string" ? { ...schema2, proto: builtinConstructors[schema2.proto] } : schema2;
    if (typeof normalized.proto !== "function")
      throwParseError(Proto.writeInvalidSchemaMessage(normalized.proto));
    if (hasKey(normalized, "dateAllowsInvalid") && normalized.proto !== Date)
      throwParseError(Proto.writeBadInvalidDateMessage(normalized.proto));
    return normalized;
  },
  applyConfig: (schema2, config) => {
    if (schema2.dateAllowsInvalid === void 0 && schema2.proto === Date && config.dateAllowsInvalid)
      return { ...schema2, dateAllowsInvalid: true };
    return schema2;
  },
  defaults: {
    description: (node2) => node2.builtinName ? objectKindDescriptions[node2.builtinName] : `an instance of ${node2.proto.name}`,
    actual: (data) => data instanceof Date && data.toString() === "Invalid Date" ? "an invalid Date" : objectKindOrDomainOf(data)
  },
  intersections: {
    proto: (l, r) => l.proto === Date && r.proto === Date ? (
      // since l === r is handled by default,
      // exactly one of l or r must have allow invalid dates
      l.dateAllowsInvalid ? r : l
    ) : constructorExtends(l.proto, r.proto) ? l : constructorExtends(r.proto, l.proto) ? r : Disjoint.init("proto", l, r),
    domain: (proto, domain) => domain.domain === "object" ? proto : Disjoint.init("domain", $ark.intrinsic.object.internal, domain)
  }
});
var ProtoNode = class extends InternalBasis {
  builtinName = getBuiltinNameOfConstructor(this.proto);
  serializedConstructor = this.json.proto;
  requiresInvalidDateCheck = this.proto === Date && !this.dateAllowsInvalid;
  // Array.isArray is realm-safe; `instanceof Array` rejects arrays from other
  // windows/vm contexts (https://github.com/arktypeio/arktype/issues/1597).
  isArrayProto = this.proto === Array;
  traverseAllows = this.requiresInvalidDateCheck ? (data) => data instanceof Date && data.toString() !== "Invalid Date" : this.isArrayProto ? (data) => isArray(data) : (data) => data instanceof this.proto;
  compiledCondition = this.isArrayProto ? `Array.isArray(data)` : `data instanceof ${this.serializedConstructor}${this.requiresInvalidDateCheck ? ` && data.toString() !== "Invalid Date"` : ""}`;
  compiledNegation = `!(${this.compiledCondition})`;
  innerToJsonSchema(ctx) {
    switch (this.builtinName) {
      case "Array":
        return {
          type: "array"
        };
      case "Date":
        return ctx.fallback.date?.({ code: "date", base: {} }) ?? ctx.fallback.proto({ code: "proto", base: {}, proto: this.proto });
      default:
        return ctx.fallback.proto({
          code: "proto",
          base: {},
          proto: this.proto
        });
    }
  }
  expression = this.dateAllowsInvalid ? "Date | InvalidDate" : this.proto.name;
  get nestableExpression() {
    return this.dateAllowsInvalid ? `(${this.expression})` : this.expression;
  }
  domain = "object";
  get defaultShortDescription() {
    return this.description;
  }
};
var Proto = {
  implementation: implementation16,
  Node: ProtoNode,
  writeBadInvalidDateMessage: (actual) => `dateAllowsInvalid may only be specified with constructor Date (was ${actual.name})`,
  writeInvalidSchemaMessage: (actual) => `instanceOf operand must be a function (was ${domainOf(actual)})`
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/union.js
var implementation17 = implementNode({
  kind: "union",
  hasAssociatedError: true,
  collapsibleKey: "branches",
  keys: {
    ordered: {},
    branches: {
      child: true,
      parse: (schema2, ctx) => {
        const branches = [];
        for (const branchSchema of schema2) {
          const branchNodes = hasArkKind(branchSchema, "root") ? branchSchema.branches : ctx.$.parseSchema(branchSchema).branches;
          for (const node2 of branchNodes) {
            if (node2.hasKind("morph")) {
              const matchingMorphIndex = branches.findIndex((matching) => matching.hasKind("morph") && matching.hasEqualMorphs(node2));
              if (matchingMorphIndex === -1)
                branches.push(node2);
              else {
                const matchingMorph = branches[matchingMorphIndex];
                const mergedIn = matchingMorph.inner.in && node2.inner.in ? matchingMorph.inner.in.rawOr(node2.inner.in) : matchingMorph.rawIn.rawOr(node2.rawIn);
                branches[matchingMorphIndex] = ctx.$.node("morph", {
                  ...matchingMorph.inner,
                  in: mergedIn
                });
              }
            } else
              branches.push(node2);
          }
        }
        if (!ctx.def.ordered)
          branches.sort((l, r) => l.hash < r.hash ? -1 : 1);
        return branches;
      }
    }
  },
  normalize: (schema2) => isArray(schema2) ? { branches: schema2 } : schema2,
  reduce: (inner, $) => {
    const reducedBranches = reduceBranches(inner);
    if (reducedBranches.length === 1)
      return reducedBranches[0];
    if (reducedBranches.length === inner.branches.length)
      return;
    return $.node("union", {
      ...inner,
      branches: reducedBranches
    }, { prereduced: true });
  },
  defaults: {
    description: (node2) => node2.distribute((branch) => branch.description, describeBranches),
    expected: (ctx) => {
      const byPath = groupBy(ctx.errors, "propString");
      const pathDescriptions = Object.entries(byPath).map(([path, errors]) => {
        const branchesAtPath = [];
        for (const errorAtPath of errors)
          appendUnique(branchesAtPath, errorAtPath.expected);
        const expected = describeBranches(branchesAtPath);
        const actual = errors.every((e) => e.actual === errors[0].actual) ? errors[0].actual : printable(errors[0].data);
        return `${path && `${path} `}must be ${expected}${actual && ` (was ${actual})`}`;
      });
      return describeBranches(pathDescriptions);
    },
    problem: (ctx) => ctx.expected,
    message: (ctx) => {
      if (ctx.problem[0] === "[") {
        return `value at ${ctx.problem}`;
      }
      return ctx.problem;
    }
  },
  intersections: {
    union: (l, r, ctx) => {
      if (l.isNever !== r.isNever) {
        return Disjoint.init("presence", l, r);
      }
      let resultBranches;
      if (l.ordered) {
        if (r.ordered) {
          throwParseError(writeOrderedIntersectionMessage(l.expression, r.expression));
        }
        resultBranches = intersectBranches(r.branches, l.branches, ctx);
        if (resultBranches instanceof Disjoint)
          resultBranches.invert();
      } else
        resultBranches = intersectBranches(l.branches, r.branches, ctx);
      if (resultBranches instanceof Disjoint)
        return resultBranches;
      return ctx.$.parseSchema(l.ordered || r.ordered ? {
        branches: resultBranches,
        ordered: true
      } : { branches: resultBranches });
    },
    ...defineRightwardIntersections("union", (l, r, ctx) => {
      const branches = intersectBranches(l.branches, [r], ctx);
      if (branches instanceof Disjoint)
        return branches;
      if (branches.length === 1)
        return branches[0];
      return ctx.$.parseSchema(l.ordered ? { branches, ordered: true } : { branches });
    })
  }
});
var UnionNode = class extends BaseRoot {
  isBoolean = this.branches.length === 2 && this.branches[0].hasUnit(false) && this.branches[1].hasUnit(true);
  get branchGroups() {
    const branchGroups = [];
    let firstBooleanIndex = -1;
    for (const branch of this.branches) {
      if (branch.hasKind("unit") && branch.domain === "boolean") {
        if (firstBooleanIndex === -1) {
          firstBooleanIndex = branchGroups.length;
          branchGroups.push(branch);
        } else
          branchGroups[firstBooleanIndex] = $ark.intrinsic.boolean;
        continue;
      }
      branchGroups.push(branch);
    }
    return branchGroups;
  }
  unitBranches = this.branches.filter((n) => n.rawIn.hasKind("unit"));
  discriminant = this.discriminate();
  discriminantJson = this.discriminant ? discriminantToJson(this.discriminant) : null;
  expression = this.distribute((n) => n.nestableExpression, expressBranches);
  createBranchedOptimisticRootApply() {
    return (data, onFail) => {
      const optimisticResult = this.traverseOptimistic(data);
      if (optimisticResult !== unset)
        return optimisticResult;
      const ctx = new Traversal(data, this.$.resolvedConfig);
      this.traverseApply(data, ctx);
      return ctx.finalize(onFail);
    };
  }
  get shallowMorphs() {
    return this.branches.reduce((morphs, branch) => appendUnique(morphs, branch.shallowMorphs), []);
  }
  get defaultShortDescription() {
    return this.distribute((branch) => branch.defaultShortDescription, describeBranches);
  }
  innerToJsonSchema(ctx) {
    if (this.branchGroups.length === 1 && this.branchGroups[0].equals($ark.intrinsic.boolean))
      return { type: "boolean" };
    const jsonSchemaBranches = this.branchGroups.map((group) => group.toJsonSchemaRecurse(ctx));
    if (jsonSchemaBranches.every((branch) => (
      // iff all branches are pure unit values with no metadata,
      // we can simplify the representation to an enum
      Object.keys(branch).length === 1 && hasKey(branch, "const")
    ))) {
      return {
        enum: jsonSchemaBranches.map((branch) => branch.const)
      };
    }
    return {
      anyOf: jsonSchemaBranches
    };
  }
  traverseAllows = (data, ctx) => this.branches.some((b) => b.traverseAllows(data, ctx));
  traverseApply = (data, ctx) => {
    const errors = [];
    for (let i = 0; i < this.branches.length; i++) {
      ctx.pushBranch();
      this.branches[i].traverseApply(data, ctx);
      if (!ctx.hasError()) {
        if (this.branches[i].includesTransform)
          return ctx.queuedMorphs.push(...ctx.popBranch().queuedMorphs);
        return ctx.popBranch();
      }
      errors.push(ctx.popBranch().error);
    }
    ctx.errorFromNodeContext({ code: "union", errors, meta: this.meta });
  };
  traverseOptimistic = (data) => {
    for (let i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i];
      if (branch.traverseAllows(data)) {
        if (branch.contextFreeMorph)
          return branch.contextFreeMorph(data);
        return data;
      }
    }
    return unset;
  };
  compile(js) {
    if (!this.discriminant || // if we have a union of two units like `boolean`, the
    // undiscriminated compilation will be just as fast
    this.unitBranches.length === this.branches.length && this.branches.length === 2)
      return this.compileIndiscriminable(js);
    let condition = this.discriminant.optionallyChainedPropString;
    if (this.discriminant.kind === "domain")
      condition = `typeof ${condition} === "object" ? ${condition} === null ? "null" : "object" : typeof ${condition} === "function" ? "object" : typeof ${condition}`;
    const cases = this.discriminant.cases;
    const caseKeys = Object.keys(cases);
    const { optimistic } = js;
    js.optimistic = false;
    js.block(`switch(${condition})`, () => {
      for (const k in cases) {
        const v = cases[k];
        const caseCondition = k === "default" ? k : `case ${k}`;
        let caseResult;
        if (v === true)
          caseResult = optimistic ? "data" : "true";
        else if (optimistic) {
          if (v.rootApplyStrategy === "branchedOptimistic")
            caseResult = js.invoke(v, { kind: "Optimistic" });
          else if (v.contextFreeMorph)
            caseResult = `${js.invoke(v)} ? ${registeredReference(v.contextFreeMorph)}(data) : "${unset}"`;
          else
            caseResult = `${js.invoke(v)} ? data : "${unset}"`;
        } else
          caseResult = js.invoke(v);
        js.line(`${caseCondition}: return ${caseResult}`);
      }
      return js;
    });
    if (js.traversalKind === "Allows") {
      js.return(optimistic ? `"${unset}"` : false);
      return;
    }
    const expected = describeBranches(this.discriminant.kind === "domain" ? caseKeys.map((k) => {
      const jsTypeOf = k.slice(1, -1);
      return jsTypeOf === "function" ? domainDescriptions.object : domainDescriptions[jsTypeOf];
    }) : caseKeys);
    const serializedPathSegments = this.discriminant.path.map((k) => typeof k === "symbol" ? registeredReference(k) : JSON.stringify(k));
    const serializedExpected = JSON.stringify(expected);
    const serializedActual = this.discriminant.kind === "domain" ? `${serializedTypeOfDescriptions}[${condition}]` : `${serializedPrintable}(${condition})`;
    js.line(`ctx.errorFromNodeContext({
	code: "predicate",
	expected: ${serializedExpected},
	actual: ${serializedActual},
	relativePath: [${serializedPathSegments}],
	meta: ${this.compiledMeta}
})`);
  }
  compileIndiscriminable(js) {
    if (js.traversalKind === "Apply") {
      js.const("errors", "[]");
      for (const branch of this.branches) {
        js.line("ctx.pushBranch()").line(js.invoke(branch)).if("!ctx.hasError()", () => js.return(branch.includesTransform ? "ctx.queuedMorphs.push(...ctx.popBranch().queuedMorphs)" : "ctx.popBranch()")).line("errors.push(ctx.popBranch().error)");
      }
      js.line(`ctx.errorFromNodeContext({ code: "union", errors, meta: ${this.compiledMeta} })`);
    } else {
      const { optimistic } = js;
      js.optimistic = false;
      for (const branch of this.branches) {
        js.if(`${js.invoke(branch)}`, () => js.return(optimistic ? branch.contextFreeMorph ? `${registeredReference(branch.contextFreeMorph)}(data)` : "data" : true));
      }
      js.return(optimistic ? `"${unset}"` : false);
    }
  }
  get nestableExpression() {
    return this.isBoolean ? "boolean" : `(${this.expression})`;
  }
  discriminate() {
    if (this.branches.length < 2)
      return null;
    if (this.unitBranches.length === this.branches.length) {
      const cases2 = flatMorph(this.unitBranches, (i, n) => [
        `${n.rawIn.serializedValue}`,
        n.hasKind("morph") ? n : true
      ]);
      return {
        kind: "unit",
        path: [],
        optionallyChainedPropString: "data",
        cases: cases2
      };
    }
    const candidates = [];
    for (let lIndex = 0; lIndex < this.branches.length - 1; lIndex++) {
      const l = this.branches[lIndex];
      for (let rIndex = lIndex + 1; rIndex < this.branches.length; rIndex++) {
        const r = this.branches[rIndex];
        const result = intersectNodesRoot(l.rawIn, r.rawIn, l.$);
        if (!(result instanceof Disjoint))
          continue;
        for (const entry of result) {
          if (!entry.kind || entry.optional)
            continue;
          let lSerialized;
          let rSerialized;
          if (entry.kind === "domain") {
            const lValue = entry.l;
            const rValue = entry.r;
            lSerialized = `"${typeof lValue === "string" ? lValue : lValue.domain}"`;
            rSerialized = `"${typeof rValue === "string" ? rValue : rValue.domain}"`;
          } else if (entry.kind === "unit") {
            lSerialized = entry.l.serializedValue;
            rSerialized = entry.r.serializedValue;
          } else
            continue;
          const matching = candidates.find((d) => arrayEquals(d.path, entry.path) && d.kind === entry.kind);
          if (!matching) {
            candidates.push({
              kind: entry.kind,
              cases: {
                [lSerialized]: {
                  branchIndices: [lIndex],
                  condition: entry.l
                },
                [rSerialized]: {
                  branchIndices: [rIndex],
                  condition: entry.r
                }
              },
              path: entry.path
            });
          } else {
            if (matching.cases[lSerialized]) {
              matching.cases[lSerialized].branchIndices = appendUnique(matching.cases[lSerialized].branchIndices, lIndex);
            } else {
              matching.cases[lSerialized] ??= {
                branchIndices: [lIndex],
                condition: entry.l
              };
            }
            if (matching.cases[rSerialized]) {
              matching.cases[rSerialized].branchIndices = appendUnique(matching.cases[rSerialized].branchIndices, rIndex);
            } else {
              matching.cases[rSerialized] ??= {
                branchIndices: [rIndex],
                condition: entry.r
              };
            }
          }
        }
      }
    }
    const viableCandidates = this.ordered ? viableOrderedCandidates(candidates, this.branches) : candidates;
    if (!viableCandidates.length)
      return null;
    const ctx = createCaseResolutionContext(viableCandidates, this);
    const cases = {};
    for (const k in ctx.best.cases) {
      const resolution = resolveCase(ctx, k);
      if (resolution === null) {
        cases[k] = true;
        continue;
      }
      if (resolution.length === this.branches.length)
        return null;
      if (this.ordered) {
        resolution.sort((l, r) => l.originalIndex - r.originalIndex);
      }
      const branches = resolution.map((entry) => entry.branch);
      const caseNode = branches.length === 1 ? branches[0] : this.$.node("union", this.ordered ? { branches, ordered: true } : branches);
      Object.assign(this.referencesById, caseNode.referencesById);
      cases[k] = caseNode;
    }
    if (ctx.defaultEntries.length) {
      const branches = ctx.defaultEntries.map((entry) => entry.branch);
      cases.default = this.$.node("union", this.ordered ? { branches, ordered: true } : branches, {
        prereduced: true
      });
      Object.assign(this.referencesById, cases.default.referencesById);
    }
    return Object.assign(ctx.location, {
      cases
    });
  }
};
var createCaseResolutionContext = (viableCandidates, node2) => {
  const ordered = viableCandidates.sort((l, r) => l.path.length === r.path.length ? Object.keys(r.cases).length - Object.keys(l.cases).length : l.path.length - r.path.length);
  const best = ordered[0];
  const location = {
    kind: best.kind,
    path: best.path,
    optionallyChainedPropString: optionallyChainPropString(best.path)
  };
  const defaultEntries = node2.branches.map((branch, originalIndex) => ({
    originalIndex,
    branch
  }));
  return {
    best,
    location,
    defaultEntries,
    node: node2
  };
};
var resolveCase = (ctx, key) => {
  const caseCtx = ctx.best.cases[key];
  const discriminantNode = discriminantCaseToNode(caseCtx.condition, ctx.location.path, ctx.node.$);
  let resolvedEntries = [];
  const nextDefaults = [];
  for (let i = 0; i < ctx.defaultEntries.length; i++) {
    const entry = ctx.defaultEntries[i];
    if (caseCtx.branchIndices.includes(entry.originalIndex)) {
      const pruned = pruneDiscriminant(ctx.node.branches[entry.originalIndex], ctx.location);
      if (pruned === null) {
        resolvedEntries = null;
      } else {
        resolvedEntries?.push({
          originalIndex: entry.originalIndex,
          branch: pruned
        });
      }
    } else if (
      // we shouldn't need a special case for alias to avoid the below
      // once alias resolution issues are improved:
      // https://github.com/arktypeio/arktype/issues/1026
      entry.branch.hasKind("alias") && discriminantNode.hasKind("domain") && discriminantNode.domain === "object"
    )
      resolvedEntries?.push(entry);
    else {
      if (entry.branch.rawIn.overlaps(discriminantNode)) {
        const overlapping = pruneDiscriminant(entry.branch, ctx.location);
        resolvedEntries?.push({
          originalIndex: entry.originalIndex,
          branch: overlapping
        });
      }
      nextDefaults.push(entry);
    }
  }
  ctx.defaultEntries = nextDefaults;
  return resolvedEntries;
};
var viableOrderedCandidates = (candidates, originalBranches) => {
  const viableCandidates = candidates.filter((candidate) => {
    const caseGroups = Object.values(candidate.cases).map((caseCtx) => caseCtx.branchIndices);
    for (let i = 0; i < caseGroups.length - 1; i++) {
      const currentGroup = caseGroups[i];
      for (let j = i + 1; j < caseGroups.length; j++) {
        const nextGroup = caseGroups[j];
        for (const currentIndex of currentGroup) {
          for (const nextIndex of nextGroup) {
            if (currentIndex > nextIndex) {
              if (originalBranches[currentIndex].overlaps(originalBranches[nextIndex])) {
                return false;
              }
            }
          }
        }
      }
    }
    return true;
  });
  return viableCandidates;
};
var discriminantCaseToNode = (caseDiscriminant, path, $) => {
  let node2 = caseDiscriminant === "undefined" ? $.node("unit", { unit: void 0 }) : caseDiscriminant === "null" ? $.node("unit", { unit: null }) : caseDiscriminant === "boolean" ? $.units([true, false]) : caseDiscriminant.hasKind("domain") && caseDiscriminant.domain === "number" ? (
    // a typeof check doesn't exclude NaN
    $.node("domain", { domain: "number", numberAllowsNaN: true })
  ) : caseDiscriminant;
  for (let i = path.length - 1; i >= 0; i--) {
    const key = path[i];
    node2 = $.node("intersection", typeof key === "number" ? {
      proto: "Array",
      // create unknown for preceding elements (could be optimized with safe imports)
      sequence: [...range(key).map((_) => ({})), node2]
    } : {
      domain: "object",
      required: [{ key, value: node2 }]
    });
  }
  return node2;
};
var optionallyChainPropString = (path) => path.reduce((acc, k) => acc + compileLiteralPropAccess(k, true), "data");
var serializedTypeOfDescriptions = registeredReference(jsTypeOfDescriptions);
var serializedPrintable = registeredReference(printable);
var Union = {
  implementation: implementation17,
  Node: UnionNode
};
var discriminantToJson = (discriminant) => ({
  kind: discriminant.kind,
  path: discriminant.path.map((k) => typeof k === "string" ? k : compileSerializedValue(k)),
  cases: flatMorph(discriminant.cases, (k, node2) => [
    k,
    node2 === true ? node2 : node2.hasKind("union") && node2.discriminantJson ? node2.discriminantJson : node2.json
  ])
});
var describeExpressionOptions = {
  delimiter: " | ",
  finalDelimiter: " | "
};
var expressBranches = (expressions) => describeBranches(expressions, describeExpressionOptions);
var describeBranches = (descriptions, opts) => {
  const delimiter = opts?.delimiter ?? ", ";
  const finalDelimiter = opts?.finalDelimiter ?? " or ";
  if (descriptions.length === 0)
    return "never";
  if (descriptions.length === 1)
    return descriptions[0];
  if (descriptions.length === 2 && descriptions[0] === "false" && descriptions[1] === "true" || descriptions[0] === "true" && descriptions[1] === "false")
    return "boolean";
  const seen = {};
  const unique = descriptions.filter((s) => seen[s] ? false : seen[s] = true);
  const last = unique.pop();
  return `${unique.join(delimiter)}${unique.length ? finalDelimiter : ""}${last}`;
};
var intersectBranches = (l, r, ctx) => {
  const batchesByR = r.map(() => []);
  for (let lIndex = 0; lIndex < l.length; lIndex++) {
    let candidatesByR = {};
    for (let rIndex = 0; rIndex < r.length; rIndex++) {
      if (batchesByR[rIndex] === null) {
        continue;
      }
      if (l[lIndex].equals(r[rIndex])) {
        batchesByR[rIndex] = null;
        candidatesByR = {};
        break;
      }
      const branchIntersection = intersectOrPipeNodes(l[lIndex], r[rIndex], ctx);
      if (branchIntersection instanceof Disjoint) {
        continue;
      }
      if (branchIntersection.equals(l[lIndex])) {
        batchesByR[rIndex].push(l[lIndex]);
        candidatesByR = {};
        break;
      }
      if (branchIntersection.equals(r[rIndex])) {
        batchesByR[rIndex] = null;
      } else {
        candidatesByR[rIndex] = branchIntersection;
      }
    }
    for (const rIndex in candidatesByR) {
      batchesByR[rIndex][lIndex] = candidatesByR[rIndex];
    }
  }
  const resultBranches = batchesByR.flatMap(
    // ensure unions returned from branchable intersections like sequence are flattened
    (batch, i) => batch?.flatMap((branch) => branch.branches) ?? r[i]
  );
  return resultBranches.length === 0 ? Disjoint.init("union", l, r) : resultBranches;
};
var reduceBranches = ({ branches, ordered }) => {
  if (branches.length < 2)
    return branches;
  const uniquenessByIndex = branches.map(() => true);
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length && uniquenessByIndex[i] && uniquenessByIndex[j]; j++) {
      if (branches[i].equals(branches[j])) {
        uniquenessByIndex[j] = false;
        continue;
      }
      const intersection = intersectNodesRoot(branches[i].rawIn, branches[j].rawIn, branches[0].$);
      if (intersection instanceof Disjoint)
        continue;
      if (!ordered)
        assertDeterminateOverlap(branches[i], branches[j]);
      if (intersection.equals(branches[i].rawIn)) {
        uniquenessByIndex[i] = !!ordered;
      } else if (intersection.equals(branches[j].rawIn))
        uniquenessByIndex[j] = false;
    }
  }
  return branches.filter((_, i) => uniquenessByIndex[i]);
};
var assertDeterminateOverlap = (l, r) => {
  if (!l.includesTransform && !r.includesTransform)
    return;
  if (!arrayEquals(l.shallowMorphs, r.shallowMorphs)) {
    throwParseError(writeIndiscriminableMorphMessage(l.expression, r.expression));
  }
  if (!arrayEquals(l.flatMorphs, r.flatMorphs, {
    isEqual: (l2, r2) => l2.propString === r2.propString && (l2.node.hasKind("morph") && r2.node.hasKind("morph") ? l2.node.hasEqualMorphs(r2.node) : l2.node.hasKind("intersection") && r2.node.hasKind("intersection") ? l2.node.structure?.structuralMorphRef === r2.node.structure?.structuralMorphRef : false)
  })) {
    throwParseError(writeIndiscriminableMorphMessage(l.expression, r.expression));
  }
};
var pruneDiscriminant = (discriminantBranch, discriminantCtx) => discriminantBranch.transform((nodeKind, inner) => {
  if (nodeKind === "domain" || nodeKind === "unit")
    return null;
  return inner;
}, {
  shouldTransform: (node2, ctx) => {
    const propString = optionallyChainPropString(ctx.path);
    if (!discriminantCtx.optionallyChainedPropString.startsWith(propString))
      return false;
    if (node2.hasKind("domain") && node2.domain === "object")
      return true;
    if ((node2.hasKind("domain") || discriminantCtx.kind === "unit") && propString === discriminantCtx.optionallyChainedPropString) {
      return discriminantCtx.kind === "unit" || !(node2.hasKind("domain") && node2.requiresNaNCheck);
    }
    return node2.children.length !== 0 && node2.kind !== "index";
  }
});
var writeIndiscriminableMorphMessage = (lDescription, rDescription) => `An unordered union of a type including a morph and a type with overlapping input is indeterminate:
Left: ${lDescription}
Right: ${rDescription}`;
var writeOrderedIntersectionMessage = (lDescription, rDescription) => `The intersection of two ordered unions is indeterminate:
Left: ${lDescription}
Right: ${rDescription}`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/roots/unit.js
var implementation18 = implementNode({
  kind: "unit",
  hasAssociatedError: true,
  keys: {
    unit: {
      preserveUndefined: true,
      serialize: (schema2) => schema2 instanceof Date ? schema2.toISOString() : defaultValueSerializer(schema2)
    }
  },
  normalize: (schema2) => schema2,
  defaults: {
    description: (node2) => printable(node2.unit),
    problem: ({ expected, actual }) => `${expected === actual ? `must be reference equal to ${expected} (serialized to the same value)` : `must be ${expected} (was ${actual})`}`
  },
  intersections: {
    unit: (l, r) => Disjoint.init("unit", l, r),
    ...defineRightwardIntersections("unit", (l, r) => {
      if (r.allows(l.unit))
        return l;
      const rBasis = r.hasKind("intersection") ? r.basis : r;
      if (rBasis) {
        const rDomain = rBasis.hasKind("domain") ? rBasis : $ark.intrinsic.object;
        if (l.domain !== rDomain.domain) {
          const lDomainDisjointValue = l.domain === "undefined" || l.domain === "null" || l.domain === "boolean" ? l.domain : $ark.intrinsic[l.domain];
          return Disjoint.init("domain", lDomainDisjointValue, rDomain);
        }
      }
      return Disjoint.init("assignability", l, r.hasKind("intersection") ? r.children.find((rConstraint) => !rConstraint.allows(l.unit)) : r);
    })
  }
});
var UnitNode = class extends InternalBasis {
  compiledValue = this.json.unit;
  serializedValue = typeof this.unit === "string" || this.unit instanceof Date ? JSON.stringify(this.compiledValue) : `${this.compiledValue}`;
  compiledCondition = compileEqualityCheck(this.unit, this.serializedValue);
  compiledNegation = compileEqualityCheck(this.unit, this.serializedValue, "negated");
  expression = printable(this.unit);
  domain = domainOf(this.unit);
  get defaultShortDescription() {
    return this.domain === "object" ? domainDescriptions.object : this.description;
  }
  innerToJsonSchema(ctx) {
    return (
      // this is the more standard JSON schema representation, especially for Open API
      this.unit === null ? { type: "null" } : $ark.intrinsic.jsonPrimitive.allows(this.unit) ? { const: this.unit } : ctx.fallback.unit({ code: "unit", base: {}, unit: this.unit })
    );
  }
  traverseAllows = this.unit instanceof Date ? (data) => data instanceof Date && data.toISOString() === this.compiledValue : Number.isNaN(this.unit) ? (data) => Number.isNaN(data) : (data) => data === this.unit;
};
var Unit = {
  implementation: implementation18,
  Node: UnitNode
};
var compileEqualityCheck = (unit, serializedValue, negated) => {
  if (unit instanceof Date) {
    const condition = `data instanceof Date && data.toISOString() === ${serializedValue}`;
    return negated ? `!(${condition})` : condition;
  }
  if (Number.isNaN(unit))
    return `${negated ? "!" : ""}Number.isNaN(data)`;
  return `data ${negated ? "!" : "="}== ${serializedValue}`;
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/index.js
var implementation19 = implementNode({
  kind: "index",
  hasAssociatedError: false,
  intersectionIsOpen: true,
  keys: {
    signature: {
      child: true,
      parse: (schema2, ctx) => {
        const key = ctx.$.parseSchema(schema2);
        if (!key.extends($ark.intrinsic.key)) {
          return throwParseError(writeInvalidPropertyKeyMessage(key.expression));
        }
        const enumerableBranches = key.branches.filter((b) => b.hasKind("unit"));
        if (enumerableBranches.length) {
          return throwParseError(writeEnumerableIndexBranches(enumerableBranches.map((b) => printable(b.unit))));
        }
        return key;
      }
    },
    value: {
      child: true,
      parse: (schema2, ctx) => ctx.$.parseSchema(schema2)
    }
  },
  normalize: (schema2) => schema2,
  defaults: {
    description: (node2) => `[${node2.signature.expression}]: ${node2.value.description}`
  },
  intersections: {
    index: (l, r, ctx) => {
      if (l.signature.equals(r.signature)) {
        const valueIntersection = intersectOrPipeNodes(l.value, r.value, ctx);
        const value2 = valueIntersection instanceof Disjoint ? $ark.intrinsic.never.internal : valueIntersection;
        return ctx.$.node("index", { signature: l.signature, value: value2 });
      }
      if (l.signature.extends(r.signature) && l.value.subsumes(r.value))
        return r;
      if (r.signature.extends(l.signature) && r.value.subsumes(l.value))
        return l;
      return null;
    }
  }
});
var IndexNode = class extends BaseConstraint {
  impliedBasis = $ark.intrinsic.object.internal;
  expression = `[${this.signature.expression}]: ${this.value.expression}`;
  flatRefs = append(this.value.flatRefs.map((ref) => flatRef([this.signature, ...ref.path], ref.node)), flatRef([this.signature], this.value));
  traverseAllows = (data, ctx) => stringAndSymbolicEntriesOf(data).every((entry) => {
    if (this.signature.traverseAllows(entry[0], ctx)) {
      return traverseKey(entry[0], () => this.value.traverseAllows(entry[1], ctx), ctx);
    }
    return true;
  });
  traverseApply = (data, ctx) => {
    for (const entry of stringAndSymbolicEntriesOf(data)) {
      if (this.signature.traverseAllows(entry[0], ctx)) {
        traverseKey(entry[0], () => this.value.traverseApply(entry[1], ctx), ctx);
      }
    }
  };
  _transform(mapper, ctx) {
    ctx.path.push(this.signature);
    const result = super._transform(mapper, ctx);
    ctx.path.pop();
    return result;
  }
  compile() {
  }
};
var Index = {
  implementation: implementation19,
  Node: IndexNode
};
var writeEnumerableIndexBranches = (keys) => `Index keys ${keys.join(", ")} should be specified as named props.`;
var writeInvalidPropertyKeyMessage = (indexSchema) => `Indexed key definition '${indexSchema}' must be a string or symbol`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/required.js
var implementation20 = implementNode({
  kind: "required",
  hasAssociatedError: true,
  intersectionIsOpen: true,
  keys: {
    key: {},
    value: {
      child: true,
      parse: (schema2, ctx) => ctx.$.parseSchema(schema2)
    }
  },
  normalize: (schema2) => schema2,
  defaults: {
    description: (node2) => `${node2.compiledKey}: ${node2.value.description}`,
    expected: (ctx) => ctx.missingValueDescription,
    actual: () => "missing"
  },
  intersections: {
    required: intersectProps,
    optional: intersectProps
  }
});
var RequiredNode = class extends BaseProp {
  expression = `${this.compiledKey}: ${this.value.expression}`;
  errorContext = Object.freeze({
    code: "required",
    missingValueDescription: this.value.defaultShortDescription,
    relativePath: [this.key],
    meta: this.meta
  });
  compiledErrorContext = compileObjectLiteral(this.errorContext);
};
var Required = {
  implementation: implementation20,
  Node: RequiredNode
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/sequence.js
var implementation21 = implementNode({
  kind: "sequence",
  hasAssociatedError: false,
  collapsibleKey: "variadic",
  keys: {
    prefix: {
      child: true,
      parse: (schema2, ctx) => {
        if (schema2.length === 0)
          return void 0;
        return schema2.map((element) => ctx.$.parseSchema(element));
      },
      reduceIo: (ioKind, inner, prefix) => {
        inner.prefix = [
          ...prefix.map((node2) => ioKind === "in" ? node2.rawIn : node2.rawOut),
          ...inner.prefix ?? []
        ];
      }
    },
    optionals: {
      child: true,
      parse: (schema2, ctx) => {
        if (schema2.length === 0)
          return void 0;
        return schema2.map((element) => ctx.$.parseSchema(element));
      },
      reduceIo: (ioKind, inner, optionals) => {
        inner.optionals = append(inner.optionals, optionals.map((node2) => ioKind === "in" ? node2.rawIn : node2.rawOut));
      }
    },
    defaultables: {
      child: (defaultables) => defaultables.map((element) => element[0]),
      parse: (defaultables, ctx) => {
        if (defaultables.length === 0)
          return void 0;
        return defaultables.map((element) => {
          const node2 = ctx.$.parseSchema(element[0]);
          assertDefaultValueAssignability(node2, element[1], null);
          return [node2, element[1]];
        });
      },
      serialize: (defaults) => defaults.map((element) => [
        element[0].collapsibleJson,
        defaultValueSerializer(element[1])
      ]),
      reduceIo: (ioKind, inner, defaultables) => {
        if (ioKind === "in") {
          inner.optionals = defaultables.map((d) => d[0].rawIn);
          return;
        }
        inner.prefix = defaultables.map((d) => d[0].rawOut);
        return;
      }
    },
    variadic: {
      child: true,
      parse: (schema2, ctx) => ctx.$.parseSchema(schema2, ctx)
    },
    minVariadicLength: {
      // minVariadicLength is reflected in the id of this node,
      // but not its IntersectionNode parent since it is superceded by the minLength
      // node it implies
      parse: (min) => min === 0 ? void 0 : min
    },
    postfix: {
      child: true,
      parse: (schema2, ctx) => {
        if (schema2.length === 0)
          return void 0;
        return schema2.map((element) => ctx.$.parseSchema(element));
      }
    }
  },
  normalize: (schema2) => {
    if (typeof schema2 === "string")
      return { variadic: schema2 };
    if ("variadic" in schema2 || "prefix" in schema2 || "defaultables" in schema2 || "optionals" in schema2 || "postfix" in schema2 || "minVariadicLength" in schema2) {
      if (schema2.postfix?.length) {
        if (!schema2.variadic)
          return throwParseError(postfixWithoutVariadicMessage);
        if (schema2.optionals?.length || schema2.defaultables?.length)
          return throwParseError(postfixAfterOptionalOrDefaultableMessage);
      }
      if (schema2.minVariadicLength && !schema2.variadic) {
        return throwParseError("minVariadicLength may not be specified without a variadic element");
      }
      return schema2;
    }
    return { variadic: schema2 };
  },
  reduce: (raw, $) => {
    let minVariadicLength = raw.minVariadicLength ?? 0;
    const prefix = raw.prefix?.slice() ?? [];
    const defaultables = raw.defaultables?.slice() ?? [];
    const optionals = raw.optionals?.slice() ?? [];
    const postfix = raw.postfix?.slice() ?? [];
    if (raw.variadic) {
      while (optionals[optionals.length - 1]?.equals(raw.variadic))
        optionals.pop();
      if (optionals.length === 0 && defaultables.length === 0) {
        while (prefix[prefix.length - 1]?.equals(raw.variadic)) {
          prefix.pop();
          minVariadicLength++;
        }
      }
      while (postfix[0]?.equals(raw.variadic)) {
        postfix.shift();
        minVariadicLength++;
      }
    } else if (optionals.length === 0 && defaultables.length === 0) {
      prefix.push(...postfix.splice(0));
    }
    if (
      // if any variadic adjacent elements were moved to minVariadicLength
      minVariadicLength !== raw.minVariadicLength || // or any postfix elements were moved to prefix
      raw.prefix && raw.prefix.length !== prefix.length
    ) {
      return $.node("sequence", {
        ...raw,
        // empty lists will be omitted during parsing
        prefix,
        defaultables,
        optionals,
        postfix,
        minVariadicLength
      }, { prereduced: true });
    }
  },
  defaults: {
    description: (node2) => {
      if (node2.isVariadicOnly)
        return `${node2.variadic.nestableExpression}[]`;
      const innerDescription = node2.tuple.map((element) => element.kind === "defaultables" ? `${element.node.nestableExpression} = ${printable(element.default)}` : element.kind === "optionals" ? `${element.node.nestableExpression}?` : element.kind === "variadic" ? `...${element.node.nestableExpression}[]` : element.node.expression).join(", ");
      return `[${innerDescription}]`;
    }
  },
  intersections: {
    sequence: (l, r, ctx) => {
      const rootState = _intersectSequences({
        l: l.tuple,
        r: r.tuple,
        disjoint: new Disjoint(),
        result: [],
        fixedVariants: [],
        ctx
      });
      const viableBranches = rootState.disjoint.length === 0 ? [rootState, ...rootState.fixedVariants] : rootState.fixedVariants;
      return viableBranches.length === 0 ? rootState.disjoint : viableBranches.length === 1 ? ctx.$.node("sequence", sequenceTupleToInner(viableBranches[0].result)) : ctx.$.node("union", viableBranches.map((state) => ({
        proto: Array,
        sequence: sequenceTupleToInner(state.result)
      })));
    }
    // exactLength, minLength, and maxLength don't need to be defined
    // here since impliedSiblings guarantees they will be added
    // directly to the IntersectionNode parent of the SequenceNode
    // they exist on
  }
});
var SequenceNode = class extends BaseConstraint {
  impliedBasis = $ark.intrinsic.Array.internal;
  tuple = sequenceInnerToTuple(this.inner);
  prefixLength = this.prefix?.length ?? 0;
  defaultablesLength = this.defaultables?.length ?? 0;
  optionalsLength = this.optionals?.length ?? 0;
  postfixLength = this.postfix?.length ?? 0;
  defaultablesAndOptionals = [];
  prevariadic = this.tuple.filter((el) => {
    if (el.kind === "defaultables" || el.kind === "optionals") {
      this.defaultablesAndOptionals.push(el.node);
      return true;
    }
    return el.kind === "prefix";
  });
  variadicOrPostfix = conflatenate(this.variadic && [this.variadic], this.postfix);
  // have to wait until prevariadic and variadicOrPostfix are set to calculate
  flatRefs = this.addFlatRefs();
  addFlatRefs() {
    appendUniqueFlatRefs(this.flatRefs, this.prevariadic.flatMap((element, i) => append(element.node.flatRefs.map((ref) => flatRef([`${i}`, ...ref.path], ref.node)), flatRef([`${i}`], element.node))));
    appendUniqueFlatRefs(this.flatRefs, this.variadicOrPostfix.flatMap((element) => (
      // a postfix index can't be directly represented as a type
      // key, so we just use the same matcher for variadic
      append(element.flatRefs.map((ref) => flatRef([$ark.intrinsic.nonNegativeIntegerString.internal, ...ref.path], ref.node)), flatRef([$ark.intrinsic.nonNegativeIntegerString.internal], element))
    )));
    return this.flatRefs;
  }
  isVariadicOnly = this.prevariadic.length + this.postfixLength === 0;
  minVariadicLength = this.inner.minVariadicLength ?? 0;
  minLength = this.prefixLength + this.minVariadicLength + this.postfixLength;
  minLengthNode = this.minLength === 0 ? null : this.$.node("minLength", this.minLength);
  maxLength = this.variadic ? null : this.tuple.length;
  maxLengthNode = this.maxLength === null ? null : this.$.node("maxLength", this.maxLength);
  impliedSiblings = this.minLengthNode ? this.maxLengthNode ? [this.minLengthNode, this.maxLengthNode] : [this.minLengthNode] : this.maxLengthNode ? [this.maxLengthNode] : [];
  defaultValueMorphs = getDefaultableMorphs(this);
  defaultValueMorphsReference = this.defaultValueMorphs.length ? registeredReference(this.defaultValueMorphs) : void 0;
  optionalize() {
    const { prefix, defaultables, ...inner } = this.inner;
    if (!prefix)
      return this;
    return this.$.node("sequence", {
      ...inner,
      optionals: conflatenate(prefix, this.defaultablesAndOptionals)
    });
  }
  require() {
    const { defaultables, optionals, ...inner } = this.inner;
    return this.$.node("sequence", {
      ...inner,
      prefix: conflatenate(this.prefix, this.defaultablesAndOptionals)
    });
  }
  elementAtIndex(data, index) {
    if (index < this.prevariadic.length)
      return this.tuple[index];
    const firstPostfixIndex = data.length - this.postfixLength;
    if (index >= firstPostfixIndex)
      return { kind: "postfix", node: this.postfix[index - firstPostfixIndex] };
    return {
      kind: "variadic",
      node: this.variadic ?? throwInternalError(`Unexpected attempt to access index ${index} on ${this}`)
    };
  }
  // minLength/maxLength should be checked by Intersection before either traversal
  traverseAllows = (data, ctx) => {
    for (let i = 0; i < data.length; i++) {
      if (!this.elementAtIndex(data, i).node.traverseAllows(data[i], ctx))
        return false;
    }
    return true;
  };
  traverseApply = (data, ctx) => {
    const errorCount = ctx.currentErrorCount;
    let i = 0;
    for (; i < data.length; i++) {
      traverseKey(i, () => this.elementAtIndex(data, i).node.traverseApply(data[i], ctx), ctx);
      if (ctx.failFast && ctx.currentErrorCount > errorCount)
        return;
    }
  };
  get element() {
    return this.cacheGetter("element", this.$.node("union", this.children));
  }
  // minLength/maxLength compilation should be handled by Intersection
  compile(js) {
    if (js.traversalKind === "Apply")
      js.initializeErrorCount();
    if (this.prefix) {
      for (const [i, node2] of this.prefix.entries()) {
        js.traverseKey(`${i}`, `data[${i}]`, node2);
        if (js.traversalKind === "Apply")
          js.returnIfFailFast();
      }
    }
    for (const [i, node2] of this.defaultablesAndOptionals.entries()) {
      const dataIndex = `${i + this.prefixLength}`;
      js.if(`${dataIndex} >= data.length`, () => js.traversalKind === "Allows" ? js.return(true) : js.return());
      js.traverseKey(dataIndex, `data[${dataIndex}]`, node2);
      if (js.traversalKind === "Apply")
        js.returnIfFailFast();
    }
    if (this.variadic) {
      if (this.postfix) {
        js.const("firstPostfixIndex", `data.length${this.postfix ? `- ${this.postfix.length}` : ""}`);
      }
      js.for(`i < ${this.postfix ? "firstPostfixIndex" : "data.length"}`, () => {
        js.traverseKey("i", "data[i]", this.variadic);
        return js.traversalKind === "Apply" ? js.returnIfFailFast() : js;
      }, this.prevariadic.length);
      if (this.postfix) {
        for (const [i, node2] of this.postfix.entries()) {
          const keyExpression = `firstPostfixIndex + ${i}`;
          js.traverseKey(keyExpression, `data[${keyExpression}]`, node2);
          if (js.traversalKind === "Apply")
            js.returnIfFailFast();
        }
      }
    }
    if (js.traversalKind === "Allows")
      js.return(true);
  }
  _transform(mapper, ctx) {
    ctx.path.push($ark.intrinsic.nonNegativeIntegerString.internal);
    const result = super._transform(mapper, ctx);
    ctx.path.pop();
    return result;
  }
  // this depends on tuple so needs to come after it
  expression = this.description;
  reduceJsonSchema(schema2, ctx) {
    const isDraft07 = ctx.target === "draft-07";
    if (this.prevariadic.length) {
      const prefixSchemas = this.prevariadic.map((el) => {
        const valueSchema = el.node.toJsonSchemaRecurse(ctx);
        if (el.kind === "defaultables") {
          const value2 = typeof el.default === "function" ? el.default() : el.default;
          const jsonDefault = $ark.intrinsic.jsonData.allows(value2) ? value2 : ctx.fallback.defaultValue({
            code: "defaultValue",
            base: valueSchema,
            value: value2
          });
          if (jsonDefault !== void 0)
            valueSchema.default = jsonDefault;
        }
        return valueSchema;
      });
      if (isDraft07)
        schema2.items = prefixSchemas;
      else
        schema2.prefixItems = prefixSchemas;
    }
    if (this.minLength)
      schema2.minItems = this.minLength;
    if (this.variadic) {
      const variadicItemSchema = this.variadic.toJsonSchemaRecurse(ctx);
      if (isDraft07 && this.prevariadic.length)
        schema2.additionalItems = variadicItemSchema;
      else
        schema2.items = variadicItemSchema;
      if (this.maxLength)
        schema2.maxItems = this.maxLength;
      if (this.postfix) {
        const elements = this.postfix.map((el) => el.toJsonSchemaRecurse(ctx));
        schema2 = ctx.fallback.arrayPostfix({
          code: "arrayPostfix",
          base: schema2,
          elements
        });
      }
    } else {
      if (isDraft07)
        schema2.additionalItems = false;
      else
        schema2.items = false;
      delete schema2.maxItems;
    }
    return schema2;
  }
};
var defaultableMorphsCache = {};
var getDefaultableMorphs = (node2) => {
  if (!node2.defaultables)
    return [];
  const morphs = [];
  let cacheKey = "[";
  const lastDefaultableIndex = node2.prefixLength + node2.defaultablesLength - 1;
  for (let i = node2.prefixLength; i <= lastDefaultableIndex; i++) {
    const [elementNode, defaultValue] = node2.defaultables[i - node2.prefixLength];
    morphs.push(computeDefaultValueMorph(i, elementNode, defaultValue));
    cacheKey += `${i}: ${elementNode.id} = ${defaultValueSerializer(defaultValue)}, `;
  }
  cacheKey += "]";
  return defaultableMorphsCache[cacheKey] ??= morphs;
};
var Sequence = {
  implementation: implementation21,
  Node: SequenceNode
};
var sequenceInnerToTuple = (inner) => {
  const tuple = [];
  if (inner.prefix)
    for (const node2 of inner.prefix)
      tuple.push({ kind: "prefix", node: node2 });
  if (inner.defaultables) {
    for (const [node2, defaultValue] of inner.defaultables)
      tuple.push({ kind: "defaultables", node: node2, default: defaultValue });
  }
  if (inner.optionals)
    for (const node2 of inner.optionals)
      tuple.push({ kind: "optionals", node: node2 });
  if (inner.variadic)
    tuple.push({ kind: "variadic", node: inner.variadic });
  if (inner.postfix)
    for (const node2 of inner.postfix)
      tuple.push({ kind: "postfix", node: node2 });
  return tuple;
};
var sequenceTupleToInner = (tuple) => tuple.reduce((result, element) => {
  if (element.kind === "variadic")
    result.variadic = element.node;
  else if (element.kind === "defaultables") {
    result.defaultables = append(result.defaultables, [
      [element.node, element.default]
    ]);
  } else
    result[element.kind] = append(result[element.kind], element.node);
  return result;
}, {});
var postfixAfterOptionalOrDefaultableMessage = "A postfix required element cannot follow an optional or defaultable element";
var postfixWithoutVariadicMessage = "A postfix element requires a variadic element";
var _intersectSequences = (s) => {
  const [lHead, ...lTail] = s.l;
  const [rHead, ...rTail] = s.r;
  if (!lHead || !rHead)
    return s;
  const lHasPostfix = lTail[lTail.length - 1]?.kind === "postfix";
  const rHasPostfix = rTail[rTail.length - 1]?.kind === "postfix";
  const kind = lHead.kind === "prefix" || rHead.kind === "prefix" ? "prefix" : lHead.kind === "postfix" || rHead.kind === "postfix" ? "postfix" : lHead.kind === "variadic" && rHead.kind === "variadic" ? "variadic" : lHasPostfix || rHasPostfix ? "prefix" : lHead.kind === "defaultables" || rHead.kind === "defaultables" ? "defaultables" : "optionals";
  if (lHead.kind === "prefix" && rHead.kind === "variadic" && rHasPostfix) {
    const postfixBranchResult = _intersectSequences({
      ...s,
      fixedVariants: [],
      r: rTail.map((element) => ({ ...element, kind: "prefix" }))
    });
    if (postfixBranchResult.disjoint.length === 0)
      s.fixedVariants.push(postfixBranchResult);
  } else if (rHead.kind === "prefix" && lHead.kind === "variadic" && lHasPostfix) {
    const postfixBranchResult = _intersectSequences({
      ...s,
      fixedVariants: [],
      l: lTail.map((element) => ({ ...element, kind: "prefix" }))
    });
    if (postfixBranchResult.disjoint.length === 0)
      s.fixedVariants.push(postfixBranchResult);
  }
  const result = intersectOrPipeNodes(lHead.node, rHead.node, s.ctx);
  if (result instanceof Disjoint) {
    if (kind === "prefix" || kind === "postfix") {
      s.disjoint.push(...result.withPrefixKey(
        // ideally we could handle disjoint paths more precisely here,
        // but not trivial to serialize postfix elements as keys
        kind === "prefix" ? s.result.length : `-${lTail.length + 1}`,
        // both operands must be required for the disjoint to be considered required
        elementIsRequired(lHead) && elementIsRequired(rHead) ? "required" : "optional"
      ));
      s.result = [...s.result, { kind, node: $ark.intrinsic.never.internal }];
    } else if (kind === "optionals" || kind === "defaultables") {
      return s;
    } else {
      return _intersectSequences({
        ...s,
        fixedVariants: [],
        // if there were any optional elements, there will be no postfix elements
        // so this mapping will never occur (which would be illegal otherwise)
        l: lTail.map((element) => ({ ...element, kind: "prefix" })),
        r: lTail.map((element) => ({ ...element, kind: "prefix" }))
      });
    }
  } else if (kind === "defaultables") {
    if (lHead.kind === "defaultables" && rHead.kind === "defaultables" && lHead.default !== rHead.default) {
      throwParseError(writeDefaultIntersectionMessage(lHead.default, rHead.default));
    }
    s.result = [
      ...s.result,
      {
        kind,
        node: result,
        default: lHead.kind === "defaultables" ? lHead.default : rHead.kind === "defaultables" ? rHead.default : throwInternalError(`Unexpected defaultable intersection from ${lHead.kind} and ${rHead.kind} elements.`)
      }
    ];
  } else
    s.result = [...s.result, { kind, node: result }];
  const lRemaining = s.l.length;
  const rRemaining = s.r.length;
  if (lHead.kind !== "variadic" || lRemaining >= rRemaining && (rHead.kind === "variadic" || rRemaining === 1))
    s.l = lTail;
  if (rHead.kind !== "variadic" || rRemaining >= lRemaining && (lHead.kind === "variadic" || lRemaining === 1))
    s.r = rTail;
  return _intersectSequences(s);
};
var elementIsRequired = (el) => el.kind === "prefix" || el.kind === "postfix";

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/structure.js
var createStructuralWriter = (childStringProp) => (node2) => {
  if (node2.props.length || node2.index) {
    const parts = node2.index?.map((index) => index[childStringProp]) ?? [];
    for (const prop of node2.props)
      parts.push(prop[childStringProp]);
    if (node2.undeclared)
      parts.push(`+ (undeclared): ${node2.undeclared}`);
    const objectLiteralDescription = `{ ${parts.join(", ")} }`;
    return node2.sequence ? `${objectLiteralDescription} & ${node2.sequence.description}` : objectLiteralDescription;
  }
  return node2.sequence?.description ?? "{}";
};
var structuralDescription = createStructuralWriter("description");
var structuralExpression = createStructuralWriter("expression");
var intersectPropsAndIndex = (l, r, $) => {
  const kind = l.required ? "required" : "optional";
  if (!r.signature.allows(l.key))
    return null;
  const value2 = intersectNodesRoot(l.value, r.value, $);
  if (value2 instanceof Disjoint) {
    return kind === "optional" ? $.node("optional", {
      key: l.key,
      value: $ark.intrinsic.never.internal
    }) : value2.withPrefixKey(l.key, l.kind);
  }
  return null;
};
var implementation22 = implementNode({
  kind: "structure",
  hasAssociatedError: false,
  normalize: (schema2) => schema2,
  applyConfig: (schema2, config) => {
    if (!schema2.undeclared && config.onUndeclaredKey !== "ignore") {
      return {
        ...schema2,
        undeclared: config.onUndeclaredKey
      };
    }
    return schema2;
  },
  keys: {
    required: {
      child: true,
      parse: constraintKeyParser("required"),
      reduceIo: (ioKind, inner, nodes) => {
        inner.required = append(inner.required, nodes.map((node2) => ioKind === "in" ? node2.rawIn : node2.rawOut));
        return;
      }
    },
    optional: {
      child: true,
      parse: constraintKeyParser("optional"),
      reduceIo: (ioKind, inner, nodes) => {
        if (ioKind === "in") {
          inner.optional = nodes.map((node2) => node2.rawIn);
          return;
        }
        for (const node2 of nodes) {
          inner[node2.outProp.kind] = append(inner[node2.outProp.kind], node2.outProp.rawOut);
        }
      }
    },
    index: {
      child: true,
      parse: constraintKeyParser("index")
    },
    sequence: {
      child: true,
      parse: constraintKeyParser("sequence")
    },
    undeclared: {
      parse: (behavior) => behavior === "ignore" ? void 0 : behavior,
      reduceIo: (ioKind, inner, value2) => {
        if (value2 === "reject") {
          inner.undeclared = "reject";
          return;
        }
        if (ioKind === "in")
          delete inner.undeclared;
        else
          inner.undeclared = "reject";
      }
    }
  },
  defaults: {
    description: structuralDescription
  },
  intersections: {
    structure: (l, r, ctx) => {
      const lInner = { ...l.inner };
      const rInner = { ...r.inner };
      const disjointResult = new Disjoint();
      const derived = [];
      if (l.undeclared) {
        const lKey = l.keyof();
        for (const k of r.requiredKeys) {
          if (!lKey.allows(k)) {
            disjointResult.add("presence", $ark.intrinsic.never.internal, r.propsByKey[k].value, {
              path: [k]
            });
          }
        }
        if (rInner.optional)
          rInner.optional = rInner.optional.filter((n) => lKey.allows(n.key));
        if (rInner.index) {
          rInner.index = rInner.index.flatMap((n) => {
            if (n.signature.extends(lKey))
              return n;
            const indexOverlap = intersectNodesRoot(lKey, n.signature, ctx.$);
            if (indexOverlap instanceof Disjoint)
              return [];
            const normalized = normalizeIndex(indexOverlap, n.value, ctx.$);
            derived.push(...normalized.required ?? []);
            derived.push(...normalized.optional ?? []);
            return normalized.index ?? [];
          });
        }
      }
      if (r.undeclared) {
        const rKey = r.keyof();
        for (const k of l.requiredKeys) {
          if (!rKey.allows(k)) {
            disjointResult.add("presence", l.propsByKey[k].value, $ark.intrinsic.never.internal, {
              path: [k]
            });
          }
        }
        if (lInner.optional)
          lInner.optional = lInner.optional.filter((n) => rKey.allows(n.key));
        if (lInner.index) {
          lInner.index = lInner.index.flatMap((n) => {
            if (n.signature.extends(rKey))
              return n;
            const indexOverlap = intersectNodesRoot(rKey, n.signature, ctx.$);
            if (indexOverlap instanceof Disjoint)
              return [];
            const normalized = normalizeIndex(indexOverlap, n.value, ctx.$);
            derived.push(...normalized.required ?? []);
            derived.push(...normalized.optional ?? []);
            return normalized.index ?? [];
          });
        }
      }
      const baseInner = {};
      if (l.undeclared || r.undeclared) {
        baseInner.undeclared = l.undeclared === "reject" || r.undeclared === "reject" ? "reject" : "delete";
      }
      const childIntersectionResult = intersectConstraints({
        kind: "structure",
        baseInner,
        l: flattenConstraints(lInner),
        r: [...flattenConstraints(rInner), ...derived],
        roots: [],
        ctx
      });
      if (childIntersectionResult instanceof Disjoint)
        disjointResult.push(...childIntersectionResult);
      if (disjointResult.length)
        return disjointResult;
      return childIntersectionResult;
    }
  },
  reduce: (inner, $) => {
    if (!inner.required && !inner.optional)
      return;
    const seen = /* @__PURE__ */ Object.create(null);
    let updated = false;
    const newOptionalProps = inner.optional ? [...inner.optional] : [];
    if (inner.required) {
      for (let i = 0; i < inner.required.length; i++) {
        const requiredProp = inner.required[i];
        if (requiredProp.key in seen)
          throwParseError(writeDuplicateKeyMessage(requiredProp.key));
        seen[requiredProp.key] = true;
        if (inner.index) {
          for (const index of inner.index) {
            const intersection = intersectPropsAndIndex(requiredProp, index, $);
            if (intersection instanceof Disjoint)
              return intersection;
          }
        }
      }
    }
    if (inner.optional) {
      for (let i = 0; i < inner.optional.length; i++) {
        const optionalProp = inner.optional[i];
        if (optionalProp.key in seen)
          throwParseError(writeDuplicateKeyMessage(optionalProp.key));
        seen[optionalProp.key] = true;
        if (inner.index) {
          for (const index of inner.index) {
            const intersection = intersectPropsAndIndex(optionalProp, index, $);
            if (intersection instanceof Disjoint)
              return intersection;
            if (intersection !== null) {
              newOptionalProps[i] = intersection;
              updated = true;
            }
          }
        }
      }
    }
    if (updated) {
      return $.node("structure", { ...inner, optional: newOptionalProps }, { prereduced: true });
    }
  }
});
var StructureNode = class extends BaseConstraint {
  impliedBasis = $ark.intrinsic.object.internal;
  impliedSiblings = this.children.flatMap((n) => n.impliedSiblings ?? []);
  props = conflatenate(this.required, this.optional);
  // a null prototype, so a key like "toString" isn't declared, and
  // fromEntries, so a declared "__proto__" is an own key
  propsByKey = Object.setPrototypeOf(Object.fromEntries(this.props.map((node2) => [node2.key, node2])), null);
  propsByKeyReference = registeredReference(this.propsByKey);
  expression = structuralExpression(this);
  requiredKeys = this.required?.map((node2) => node2.key) ?? [];
  optionalKeys = this.optional?.map((node2) => node2.key) ?? [];
  literalKeys = [...this.requiredKeys, ...this.optionalKeys];
  _keyof;
  keyof() {
    if (this._keyof)
      return this._keyof;
    let branches = this.$.units(this.literalKeys).branches;
    if (this.index) {
      for (const { signature } of this.index)
        branches = branches.concat(signature.branches);
    }
    return this._keyof = this.$.node("union", branches);
  }
  map(flatMapProp) {
    return this.$.node("structure", this.props.flatMap(flatMapProp).reduce((structureInner, mapped) => {
      const originalProp = this.propsByKey[mapped.key];
      if (isNode(mapped)) {
        if (mapped.kind !== "required" && mapped.kind !== "optional") {
          return throwParseError(`Map result must have kind "required" or "optional" (was ${mapped.kind})`);
        }
        structureInner[mapped.kind] = append(structureInner[mapped.kind], mapped);
        return structureInner;
      }
      const mappedKind = mapped.kind ?? originalProp?.kind ?? "required";
      const mappedPropInner = flatMorph(mapped, (k, v) => k in Optional.implementation.keys ? [k, v] : []);
      structureInner[mappedKind] = append(structureInner[mappedKind], this.$.node(mappedKind, mappedPropInner));
      return structureInner;
    }, {}));
  }
  assertHasKeys(keys) {
    const invalidKeys = keys.filter((k) => !typeOrTermExtends(k, this.keyof()));
    if (invalidKeys.length) {
      return throwParseError(writeInvalidKeysMessage(this.expression, invalidKeys));
    }
  }
  get(indexer, ...path) {
    let value2;
    let required = false;
    const key = indexerToKey(indexer);
    if ((typeof key === "string" || typeof key === "symbol") && this.propsByKey[key]) {
      value2 = this.propsByKey[key].value;
      required = this.propsByKey[key].required;
    }
    if (this.index) {
      for (const n of this.index) {
        if (typeOrTermExtends(key, n.signature))
          value2 = value2?.and(n.value) ?? n.value;
      }
    }
    if (this.sequence && typeOrTermExtends(key, $ark.intrinsic.nonNegativeIntegerString)) {
      if (hasArkKind(key, "root")) {
        if (this.sequence.variadic)
          value2 = value2?.and(this.sequence.element) ?? this.sequence.element;
      } else {
        const index = Number.parseInt(key);
        if (index < this.sequence.prevariadic.length) {
          const fixedElement = this.sequence.prevariadic[index].node;
          value2 = value2?.and(fixedElement) ?? fixedElement;
          required ||= index < this.sequence.prefixLength;
        } else if (this.sequence.variadic) {
          const nonFixedElement = this.$.node("union", this.sequence.variadicOrPostfix);
          value2 = value2?.and(nonFixedElement) ?? nonFixedElement;
        }
      }
    }
    if (!value2) {
      if (this.sequence?.variadic && hasArkKind(key, "root") && key.extends($ark.intrinsic.number)) {
        return throwParseError(writeNumberIndexMessage(key.expression, this.sequence.expression));
      }
      return throwParseError(writeInvalidKeysMessage(this.expression, [key]));
    }
    const result = value2.get(...path);
    return required ? result : result.or($ark.intrinsic.undefined);
  }
  pick(...keys) {
    this.assertHasKeys(keys);
    return this.$.node("structure", this.filterKeys("pick", keys));
  }
  omit(...keys) {
    this.assertHasKeys(keys);
    return this.$.node("structure", this.filterKeys("omit", keys));
  }
  optionalize() {
    const { required, ...inner } = this.inner;
    return this.$.node("structure", {
      ...inner,
      ...inner.sequence ? { sequence: inner.sequence.optionalize() } : {},
      optional: this.props.map((prop) => prop.hasKind("required") ? this.$.node("optional", prop.inner) : prop)
    });
  }
  require() {
    const { optional, ...inner } = this.inner;
    return this.$.node("structure", {
      ...inner,
      ...inner.sequence ? { sequence: inner.sequence.require() } : {},
      required: this.props.map((prop) => prop.hasKind("optional") ? {
        key: prop.key,
        value: prop.value
      } : prop)
    });
  }
  merge(r) {
    const inner = this.filterKeys("omit", [r.keyof()]);
    if (r.required)
      inner.required = append(inner.required, r.required);
    if (r.optional)
      inner.optional = append(inner.optional, r.optional);
    if (r.index)
      inner.index = append(inner.index, r.index);
    if (r.sequence)
      inner.sequence = r.sequence;
    if (r.undeclared)
      inner.undeclared = r.undeclared;
    else
      delete inner.undeclared;
    return this.$.node("structure", inner);
  }
  filterKeys(operation, keys) {
    const result = makeRootAndArrayPropertiesMutable(this.inner);
    const shouldKeep = (key) => {
      const matchesKey = keys.some((k) => typeOrTermExtends(key, k));
      return operation === "pick" ? matchesKey : !matchesKey;
    };
    if (result.required)
      result.required = result.required.filter((prop) => shouldKeep(prop.key));
    if (result.optional)
      result.optional = result.optional.filter((prop) => shouldKeep(prop.key));
    if (result.index)
      result.index = result.index.filter((index) => shouldKeep(index.signature));
    return result;
  }
  traverseAllows = (data, ctx) => this._traverse("Allows", data, ctx);
  traverseApply = (data, ctx) => this._traverse("Apply", data, ctx);
  _traverse = (traversalKind, data, ctx) => {
    const errorCount = ctx?.currentErrorCount ?? 0;
    for (let i = 0; i < this.props.length; i++) {
      if (traversalKind === "Allows") {
        if (!this.props[i].traverseAllows(data, ctx))
          return false;
      } else {
        this.props[i].traverseApply(data, ctx);
        if (ctx.failFast && ctx.currentErrorCount > errorCount)
          return false;
      }
    }
    if (this.sequence) {
      if (traversalKind === "Allows") {
        if (!this.sequence.traverseAllows(data, ctx))
          return false;
      } else {
        this.sequence.traverseApply(data, ctx);
        if (ctx.failFast && ctx.currentErrorCount > errorCount)
          return false;
      }
    }
    if (this.index || this.undeclared === "reject") {
      const keys = Object.keys(data);
      keys.push(...Object.getOwnPropertySymbols(data));
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (this.index) {
          for (const node2 of this.index) {
            if (node2.signature.traverseAllows(k, ctx)) {
              if (traversalKind === "Allows") {
                const result = traverseKey(k, () => node2.value.traverseAllows(data[k], ctx), ctx);
                if (!result)
                  return false;
              } else {
                traverseKey(k, () => node2.value.traverseApply(data[k], ctx), ctx);
                if (ctx.failFast && ctx.currentErrorCount > errorCount)
                  return false;
              }
            }
          }
        }
        if (this.undeclared === "reject" && !this.declaresKey(k)) {
          if (traversalKind === "Allows")
            return false;
          ctx.errorFromNodeContext({
            code: "predicate",
            expected: "removed",
            actual: "",
            relativePath: [k],
            meta: this.meta
          });
          if (ctx.failFast)
            return false;
        }
      }
    }
    if (this.structuralMorph && ctx && !ctx.hasError())
      ctx.queueMorphs([this.structuralMorph]);
    return true;
  };
  get defaultable() {
    return this.cacheGetter("defaultable", this.optional?.filter((o) => o.hasDefault()) ?? []);
  }
  declaresKey = (k) => k in this.propsByKey || this.index?.some((n) => n.signature.allows(k)) || this.sequence !== void 0 && $ark.intrinsic.nonNegativeIntegerString.allows(k);
  _compileDeclaresKey(js) {
    const parts = [];
    if (this.props.length)
      parts.push(`k in ${this.propsByKeyReference}`);
    if (this.index) {
      for (const index of this.index)
        parts.push(js.invoke(index.signature, { kind: "Allows", arg: "k" }));
    }
    if (this.sequence)
      parts.push("$ark.intrinsic.nonNegativeIntegerString.allows(k)");
    return parts.join(" || ") || "false";
  }
  get structuralMorph() {
    return this.cacheGetter("structuralMorph", getPossibleMorph(this));
  }
  structuralMorphRef = this.structuralMorph && registeredReference(this.structuralMorph);
  compile(js) {
    if (js.traversalKind === "Apply")
      js.initializeErrorCount();
    for (const prop of this.props) {
      js.check(prop);
      if (js.traversalKind === "Apply")
        js.returnIfFailFast();
    }
    if (this.sequence) {
      js.check(this.sequence);
      if (js.traversalKind === "Apply")
        js.returnIfFailFast();
    }
    if (this.index || this.undeclared === "reject") {
      js.const("keys", "Object.keys(data)");
      js.line("keys.push(...Object.getOwnPropertySymbols(data))");
      js.for("i < keys.length", () => this.compileExhaustiveEntry(js));
    }
    if (js.traversalKind === "Allows")
      return js.return(true);
    if (this.structuralMorphRef) {
      js.if("ctx && !ctx.hasError()", () => {
        js.line(`ctx.queueMorphs([`);
        precompileMorphs(js, this);
        return js.line("])");
      });
    }
  }
  compileExhaustiveEntry(js) {
    js.const("k", "keys[i]");
    if (this.index) {
      for (const node2 of this.index) {
        js.if(`${js.invoke(node2.signature, { arg: "k", kind: "Allows" })}`, () => js.traverseKey("k", "data[k]", node2.value));
      }
    }
    if (this.undeclared === "reject") {
      js.if(`!(${this._compileDeclaresKey(js)})`, () => {
        if (js.traversalKind === "Allows")
          return js.return(false);
        return js.line(`ctx.errorFromNodeContext({ code: "predicate", expected: "removed", actual: "", relativePath: [k], meta: ${this.compiledMeta} })`).if("ctx.failFast", () => js.return());
      });
    }
    return js;
  }
  reduceJsonSchema(schema2, ctx) {
    switch (schema2.type) {
      case "object":
        return this.reduceObjectJsonSchema(schema2, ctx);
      case "array":
        const arraySchema = this.sequence?.reduceJsonSchema(schema2, ctx) ?? schema2;
        if (this.props.length || this.index) {
          return ctx.fallback.arrayObject({
            code: "arrayObject",
            base: arraySchema,
            object: this.reduceObjectJsonSchema({ type: "object" }, ctx)
          });
        }
        return arraySchema;
      default:
        return ToJsonSchema.throwInternalOperandError("structure", schema2);
    }
  }
  reduceObjectJsonSchema(schema2, ctx) {
    if (this.props.length) {
      schema2.properties = {};
      for (const prop of this.props) {
        const valueSchema = prop.value.toJsonSchemaRecurse(ctx);
        if (typeof prop.key === "symbol") {
          ctx.fallback.symbolKey({
            code: "symbolKey",
            base: schema2,
            key: prop.key,
            value: valueSchema,
            optional: prop.optional
          });
          continue;
        }
        if (prop.hasDefault()) {
          const value2 = typeof prop.default === "function" ? prop.default() : prop.default;
          const jsonDefault = $ark.intrinsic.jsonData.allows(value2) ? value2 : ctx.fallback.defaultValue({
            code: "defaultValue",
            base: valueSchema,
            value: value2
          });
          if (jsonDefault !== void 0)
            valueSchema.default = jsonDefault;
        }
        schema2.properties[prop.key] = valueSchema;
      }
      if (this.requiredKeys.length && schema2.properties) {
        schema2.required = this.requiredKeys.filter((k) => typeof k === "string" && k in schema2.properties);
      }
    }
    if (this.index) {
      for (const index of this.index) {
        const valueJsonSchema = index.value.toJsonSchemaRecurse(ctx);
        if (index.signature.equals($ark.intrinsic.string)) {
          schema2.additionalProperties = valueJsonSchema;
          continue;
        }
        for (const keyBranch of index.signature.branches) {
          if (!keyBranch.extends($ark.intrinsic.string)) {
            schema2 = ctx.fallback.symbolKey({
              code: "symbolKey",
              base: schema2,
              key: null,
              value: valueJsonSchema,
              optional: false
            });
            continue;
          }
          let keySchema = { type: "string" };
          if (keyBranch.hasKind("morph")) {
            keySchema = ctx.fallback.morph({
              code: "morph",
              base: keyBranch.rawIn.toJsonSchemaRecurse(ctx),
              out: keyBranch.rawOut.toJsonSchemaRecurse(ctx)
            });
          }
          if (!keyBranch.hasKind("intersection")) {
            return throwInternalError(`Unexpected index branch kind ${keyBranch.kind}.`);
          }
          const { pattern } = keyBranch.inner;
          if (pattern) {
            const keySchemaWithPattern = Object.assign(keySchema, {
              pattern: pattern[0].rule
            });
            for (let i = 1; i < pattern.length; i++) {
              keySchema = ctx.fallback.patternIntersection({
                code: "patternIntersection",
                base: keySchemaWithPattern,
                pattern: pattern[i].rule
              });
            }
            schema2.patternProperties ??= {};
            schema2.patternProperties[keySchemaWithPattern.pattern] = valueJsonSchema;
          }
        }
      }
    }
    if (this.undeclared && !schema2.additionalProperties)
      schema2.additionalProperties = false;
    return schema2;
  }
};
var defaultableMorphsCache2 = {};
var constructStructuralMorphCacheKey = (node2) => {
  let cacheKey = "";
  for (let i = 0; i < node2.defaultable.length; i++)
    cacheKey += node2.defaultable[i].defaultValueMorphRef;
  if (node2.sequence?.defaultValueMorphsReference)
    cacheKey += node2.sequence?.defaultValueMorphsReference;
  if (node2.undeclared === "delete") {
    cacheKey += "delete !(";
    if (node2.required)
      for (const n of node2.required)
        cacheKey += n.compiledKey + " | ";
    if (node2.optional)
      for (const n of node2.optional)
        cacheKey += n.compiledKey + " | ";
    if (node2.index)
      for (const index of node2.index)
        cacheKey += index.signature.id + " | ";
    if (node2.sequence) {
      if (node2.sequence.maxLength === null)
        cacheKey += intrinsic.nonNegativeIntegerString.id;
      else {
        for (let i = 0; i < node2.sequence.tuple.length; i++)
          cacheKey += i + " | ";
      }
    }
    cacheKey += ")";
  }
  return cacheKey;
};
var getPossibleMorph = (node2) => {
  const cacheKey = constructStructuralMorphCacheKey(node2);
  if (!cacheKey)
    return void 0;
  if (defaultableMorphsCache2[cacheKey])
    return defaultableMorphsCache2[cacheKey];
  const $arkStructuralMorph = (data, ctx) => {
    for (let i = 0; i < node2.defaultable.length; i++) {
      if (!(node2.defaultable[i].key in data))
        node2.defaultable[i].defaultValueMorph(data, ctx);
    }
    if (node2.sequence?.defaultables) {
      for (let i = data.length - node2.sequence.prefixLength; i < node2.sequence.defaultables.length; i++)
        node2.sequence.defaultValueMorphs[i](data, ctx);
    }
    if (node2.undeclared === "delete") {
      for (const k in data)
        if (!node2.declaresKey(k))
          delete data[k];
    }
    return data;
  };
  return defaultableMorphsCache2[cacheKey] = $arkStructuralMorph;
};
var precompileMorphs = (js, node2) => {
  const requiresContext = node2.defaultable.some((node3) => node3.defaultValueMorph.length === 2) || node2.sequence?.defaultValueMorphs.some((morph) => morph.length === 2);
  const args2 = `(data${requiresContext ? ", ctx" : ""})`;
  return js.block(`${args2} => `, (js2) => {
    for (let i = 0; i < node2.defaultable.length; i++) {
      const { serializedKey, defaultValueMorphRef } = node2.defaultable[i];
      js2.if(`!(${serializedKey} in data)`, (js3) => js3.line(`${defaultValueMorphRef}${args2}`));
    }
    if (node2.sequence?.defaultables) {
      js2.for(`i < ${node2.sequence.defaultables.length}`, (js3) => js3.line(`${node2.sequence.defaultValueMorphsReference}[i]${args2}`), `data.length - ${node2.sequence.prefixLength}`);
    }
    if (node2.undeclared === "delete") {
      js2.forIn("data", (js3) => js3.if(`!(${node2._compileDeclaresKey(js3)})`, (js4) => js4.line(`delete data[k]`)));
    }
    return js2.return("data");
  });
};
var Structure = {
  implementation: implementation22,
  Node: StructureNode
};
var indexerToKey = (indexable) => {
  if (hasArkKind(indexable, "root") && indexable.hasKind("unit"))
    indexable = indexable.unit;
  if (typeof indexable === "number")
    indexable = `${indexable}`;
  return indexable;
};
var writeNumberIndexMessage = (indexExpression, sequenceExpression) => `${indexExpression} is not allowed as an array index on ${sequenceExpression}. Use the 'nonNegativeIntegerString' keyword instead.`;
var normalizeIndex = (signature, value2, $) => {
  const [enumerableBranches, nonEnumerableBranches] = spliterate(signature.branches, (k) => k.hasKind("unit"));
  if (!enumerableBranches.length)
    return { index: $.node("index", { signature, value: value2 }) };
  const normalized = {};
  for (const n of enumerableBranches) {
    const prop = $.node("required", { key: n.unit, value: value2 });
    normalized[prop.kind] = append(normalized[prop.kind], prop);
  }
  if (nonEnumerableBranches.length) {
    normalized.index = $.node("index", {
      signature: nonEnumerableBranches,
      value: value2
    });
  }
  return normalized;
};
var typeKeyToString = (k) => hasArkKind(k, "root") ? k.expression : printable(k);
var writeInvalidKeysMessage = (o, keys) => `Key${keys.length === 1 ? "" : "s"} ${keys.map(typeKeyToString).join(", ")} ${keys.length === 1 ? "does" : "do"} not exist on ${o}`;
var writeDuplicateKeyMessage = (key) => `Duplicate key ${compileSerializedValue(key)}`;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/kinds.js
var nodeImplementationsByKind = {
  ...boundImplementationsByKind,
  alias: Alias.implementation,
  domain: Domain.implementation,
  unit: Unit.implementation,
  proto: Proto.implementation,
  union: Union.implementation,
  morph: Morph.implementation,
  intersection: Intersection.implementation,
  divisor: Divisor.implementation,
  pattern: Pattern.implementation,
  predicate: Predicate.implementation,
  required: Required.implementation,
  optional: Optional.implementation,
  index: Index.implementation,
  sequence: Sequence.implementation,
  structure: Structure.implementation
};
$ark.defaultConfig = withAlphabetizedKeys(Object.assign(flatMorph(nodeImplementationsByKind, (kind, implementation23) => [
  kind,
  implementation23.defaults
]), {
  jitless: envHasCsp(),
  clone: deepClone,
  onUndeclaredKey: "ignore",
  exactOptionalPropertyTypes: true,
  numberAllowsNaN: false,
  dateAllowsInvalid: false,
  onFail: null,
  keywords: {},
  toJsonSchema: ToJsonSchema.defaultConfig
}));
$ark.resolvedConfig = mergeConfigs($ark.defaultConfig, $ark.config);
var nodeClassesByKind = {
  ...boundClassesByKind,
  alias: Alias.Node,
  domain: Domain.Node,
  unit: Unit.Node,
  proto: Proto.Node,
  union: Union.Node,
  morph: Morph.Node,
  intersection: Intersection.Node,
  divisor: Divisor.Node,
  pattern: Pattern.Node,
  predicate: Predicate.Node,
  required: Required.Node,
  optional: Optional.Node,
  index: Index.Node,
  sequence: Sequence.Node,
  structure: Structure.Node
};

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/module.js
var RootModule = class extends DynamicBase {
  // ensure `[arkKind]` is non-enumerable so it doesn't get spread on import/export
  get [arkKind]() {
    return "module";
  }
};
var bindModule = (module, $) => new RootModule(flatMorph(module, (alias, value2) => [
  alias,
  hasArkKind(value2, "module") ? bindModule(value2, $) : $.bindReference(value2)
]));

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/scope.js
var schemaBranchesOf = (schema2) => isArray(schema2) ? schema2 : "branches" in schema2 && isArray(schema2.branches) ? schema2.branches : void 0;
var throwMismatchedNodeRootError = (expected, actual) => throwParseError(`Node of kind ${actual} is not valid as a ${expected} definition`);
var writeDuplicateAliasError = (alias) => `#${alias} duplicates public alias ${alias}`;
var anonymousScopeCount = 0;
$ark.ambient ??= {};
var rawUnknownUnion;
var rootScopeFnName = "function $";
var precompile = (references) => bindPrecompilation(references, precompileReferences(references));
var bindPrecompilation = (references, precompiler, owningScope) => {
  const precompilation = precompiler.write(rootScopeFnName, 4);
  const compiledTraversals = precompiler.compile()();
  for (const node2 of references) {
    if (node2.precompilation && (!owningScope || node2.$ !== owningScope)) {
      continue;
    }
    node2.traverseAllows = compiledTraversals[`${node2.id}Allows`].bind(compiledTraversals);
    if (node2.isRoot() && !node2.allowsRequiresContext) {
      node2.allows = node2.traverseAllows;
    }
    node2.traverseApply = compiledTraversals[`${node2.id}Apply`].bind(compiledTraversals);
    if (compiledTraversals[`${node2.id}Optimistic`]) {
      ;
      node2.traverseOptimistic = compiledTraversals[`${node2.id}Optimistic`].bind(compiledTraversals);
    }
    node2.precompilation = precompilation;
  }
};
var precompileReferences = (references) => new CompiledFunction().return(references.reduce((js, node2) => {
  const allowsCompiler = new NodeCompiler({ kind: "Allows" }).indent();
  node2.compile(allowsCompiler);
  const allowsJs = allowsCompiler.write(`${node2.id}Allows`);
  const applyCompiler = new NodeCompiler({ kind: "Apply" }).indent();
  node2.compile(applyCompiler);
  const applyJs = applyCompiler.write(`${node2.id}Apply`);
  const result = `${js}${allowsJs},
${applyJs},
`;
  if (!node2.hasKind("union"))
    return result;
  const optimisticCompiler = new NodeCompiler({
    kind: "Allows",
    optimistic: true
  }).indent();
  node2.compile(optimisticCompiler);
  const optimisticJs = optimisticCompiler.write(`${node2.id}Optimistic`);
  return `${result}${optimisticJs},
`;
}, "{\n") + "}");
var BaseScope = class {
  config;
  resolvedConfig;
  name;
  get [arkKind]() {
    return "scope";
  }
  referencesById = {};
  references = [];
  resolutions = {};
  exportedNames = [];
  aliases = {};
  resolved = false;
  nodesByHash = {};
  intrinsic;
  constructor(def, config) {
    this.config = mergeConfigs($ark.config, config);
    this.resolvedConfig = mergeConfigs($ark.resolvedConfig, config);
    this.name = this.resolvedConfig.name ?? `anonymousScope${anonymousScopeCount++}`;
    const aliasEntries = Object.entries(def).map((entry) => this.preparseOwnAliasEntry(...entry));
    for (const [k, v] of aliasEntries) {
      let name = k;
      if (k[0] === "#") {
        name = k.slice(1);
        if (name in this.aliases)
          throwParseError(writeDuplicateAliasError(name));
        this.aliases[name] = v;
      } else {
        if (name in this.aliases)
          throwParseError(writeDuplicateAliasError(k));
        this.aliases[name] = v;
        this.exportedNames.push(name);
      }
      if (!hasArkKind(v, "module") && !hasArkKind(v, "generic") && !isThunk(v)) {
        const preparsed = this.preparseOwnDefinitionFormat(v, { alias: name });
        this.resolutions[name] = hasArkKind(preparsed, "root") ? this.bindReference(preparsed) : this.createParseContext(preparsed).id;
      }
    }
    rawUnknownUnion ??= this.node("union", {
      branches: [
        "string",
        "number",
        "object",
        "bigint",
        "symbol",
        { unit: true },
        { unit: false },
        { unit: void 0 },
        { unit: null }
      ]
    }, { prereduced: true });
    this.nodesByHash[rawUnknownUnion.hash] = this.node("intersection", {}, { prereduced: true });
    this.intrinsic = $ark.intrinsic ? flatMorph($ark.intrinsic, (k, v) => (
      // don't include cyclic aliases from JSON scope
      k.startsWith("json") ? [] : [k, this.bindReference(v)]
    )) : {};
  }
  cacheGetter(name, value2) {
    Object.defineProperty(this, name, { value: value2 });
    return value2;
  }
  get internal() {
    return this;
  }
  // json is populated when the scope is exported, so ensure it is populated
  // before allowing external access
  _json;
  get json() {
    if (!this._json)
      this.export();
    return this._json;
  }
  defineSchema(def) {
    return def;
  }
  generic = (...params) => {
    const $ = this;
    return (def, possibleHkt) => new GenericRoot(params, possibleHkt ? new LazyGenericBody(def) : def, $, $, possibleHkt ?? null);
  };
  units = (values, opts) => {
    const uniqueValues = [];
    for (const value2 of values)
      if (!uniqueValues.includes(value2))
        uniqueValues.push(value2);
    const branches = uniqueValues.map((unit) => this.node("unit", { unit }, opts));
    return this.node("union", branches, {
      ...opts,
      prereduced: true
    });
  };
  lazyResolutions = [];
  lazilyResolve(resolve2, syntheticAlias) {
    const node2 = this.node("alias", {
      reference: syntheticAlias ?? "synthetic",
      resolve: resolve2
    }, { prereduced: true });
    if (!this.resolved)
      this.lazyResolutions.push(node2);
    return node2;
  }
  schema = (schema2, opts) => this.finalize(this.parseSchema(schema2, opts));
  parseSchema = (schema2, opts) => this.node(schemaKindOf(schema2), schema2, opts);
  preparseNode(kinds, schema2, opts) {
    let kind = typeof kinds === "string" ? kinds : schemaKindOf(schema2, kinds);
    if (isNode(schema2) && schema2.kind === kind)
      return schema2;
    if (kind === "alias" && !opts?.prereduced) {
      const { reference: reference2 } = Alias.implementation.normalize(schema2, this);
      if (reference2.startsWith("$")) {
        const resolution = this.resolveRoot(reference2.slice(1));
        schema2 = resolution;
        kind = resolution.kind;
      }
    } else if (kind === "union" && hasDomain(schema2, "object")) {
      const branches = schemaBranchesOf(schema2);
      if (branches?.length === 1) {
        schema2 = branches[0];
        kind = schemaKindOf(schema2);
      }
    }
    if (isNode(schema2) && schema2.kind === kind)
      return schema2;
    const impl = nodeImplementationsByKind[kind];
    const normalizedSchema = impl.normalize?.(schema2, this) ?? schema2;
    if (isNode(normalizedSchema)) {
      return normalizedSchema.kind === kind ? normalizedSchema : throwMismatchedNodeRootError(kind, normalizedSchema.kind);
    }
    return {
      ...opts,
      $: this,
      kind,
      def: normalizedSchema,
      prefix: opts.alias ?? kind
    };
  }
  bindReference(reference2) {
    let bound;
    if (isNode(reference2)) {
      bound = reference2.$ === this ? reference2 : new reference2.constructor(reference2.attachments, this);
    } else {
      bound = reference2.$ === this ? reference2 : new GenericRoot(reference2.params, reference2.bodyDef, reference2.$, this, reference2.hkt);
    }
    if (!this.resolved) {
      Object.assign(this.referencesById, bound.referencesById);
    }
    return bound;
  }
  resolveRoot(name) {
    return this.maybeResolveRoot(name) ?? throwParseError(writeUnresolvableMessage(name));
  }
  maybeResolveRoot(name) {
    const result = this.maybeResolve(name);
    if (hasArkKind(result, "generic"))
      return;
    return result;
  }
  /** If name is a valid reference to a submodule alias, return its resolution  */
  maybeResolveSubalias(name) {
    return maybeResolveSubalias(this.aliases, name) ?? maybeResolveSubalias(this.ambient, name);
  }
  get ambient() {
    return $ark.ambient;
  }
  maybeResolve(name) {
    const cached2 = this.resolutions[name];
    if (cached2) {
      if (typeof cached2 !== "string")
        return this.bindReference(cached2);
      const v = nodesByRegisteredId[cached2];
      if (hasArkKind(v, "root"))
        return this.resolutions[name] = v;
      if (hasArkKind(v, "context")) {
        if (v.phase === "resolving") {
          return this.node("alias", { reference: `$${name}` }, { prereduced: true });
        }
        if (v.phase === "resolved") {
          return throwInternalError(`Unexpected resolved context for was uncached by its scope: ${printable(v)}`);
        }
        v.phase = "resolving";
        const node2 = this.bindReference(this.parseOwnDefinitionFormat(v.def, v));
        v.phase = "resolved";
        nodesByRegisteredId[node2.id] = node2;
        nodesByRegisteredId[v.id] = node2;
        return this.resolutions[name] = node2;
      }
      return throwInternalError(`Unexpected nodesById entry for ${cached2}: ${printable(v)}`);
    }
    let def = this.aliases[name] ?? this.ambient?.[name];
    if (!def)
      return this.maybeResolveSubalias(name);
    def = this.normalizeRootScopeValue(def);
    if (hasArkKind(def, "generic"))
      return this.resolutions[name] = this.bindReference(def);
    if (hasArkKind(def, "module")) {
      if (!def.root)
        throwParseError(writeMissingSubmoduleAccessMessage(name));
      return this.resolutions[name] = this.bindReference(def.root);
    }
    return this.resolutions[name] = this.parse(def, {
      alias: name
    });
  }
  createParseContext(input2) {
    const id = input2.id ?? registerNodeId(input2.prefix);
    return nodesByRegisteredId[id] = Object.assign(input2, {
      [arkKind]: "context",
      $: this,
      id,
      phase: "unresolved"
    });
  }
  traversal(root) {
    return new Traversal(root, this.resolvedConfig);
  }
  import(...names) {
    return new RootModule(flatMorph(this.export(...names), (alias, value2) => [
      `#${alias}`,
      value2
    ]));
  }
  precompilation;
  _exportedResolutions;
  _exports;
  export(...names) {
    if (!this._exports) {
      this._exports = {};
      for (const name of this.exportedNames) {
        const def = this.aliases[name];
        this._exports[name] = hasArkKind(def, "module") ? bindModule(def, this) : bootstrapAliasReferences(this.maybeResolve(name));
      }
      for (const node2 of this.lazyResolutions)
        node2.resolution;
      this._exportedResolutions = resolutionsOfModule(this, this._exports);
      this._json = resolutionsToJson(this._exportedResolutions);
      Object.assign(this.resolutions, this._exportedResolutions);
      this.references = Object.values(this.referencesById);
      if (!this.resolvedConfig.jitless) {
        const precompiler = precompileReferences(this.references);
        this.precompilation = precompiler.write(rootScopeFnName, 4);
        bindPrecompilation(this.references, precompiler, this);
      }
      this.resolved = true;
    }
    const namesToExport = names.length ? names : this.exportedNames;
    return new RootModule(flatMorph(namesToExport, (_, name) => [
      name,
      this._exports[name]
    ]));
  }
  resolve(name) {
    return this.export()[name];
  }
  node = (kinds, nodeSchema, opts = {}) => {
    const ctxOrNode = this.preparseNode(kinds, nodeSchema, opts);
    if (isNode(ctxOrNode))
      return this.bindReference(ctxOrNode);
    const hasPreassignedId = ctxOrNode.id !== void 0;
    const ctx = this.createParseContext(ctxOrNode);
    const node2 = parseNode(ctx);
    const bound = this.bindReference(node2);
    if (!hasPreassignedId)
      releaseUnusedContextId(ctx.id, bound);
    else
      nodesByRegisteredId[ctx.id] = bound;
    return bound;
  };
  parse = (def, opts = {}) => this.finalize(this.parseDefinition(def, opts));
  parseDefinition(def, opts = {}) {
    if (hasArkKind(def, "root"))
      return this.bindReference(def);
    const ctxInputOrNode = this.preparseOwnDefinitionFormat(def, opts);
    if (hasArkKind(ctxInputOrNode, "root"))
      return this.bindReference(ctxInputOrNode);
    const hasPreassignedId = ctxInputOrNode.id !== void 0;
    const ctx = this.createParseContext(ctxInputOrNode);
    let node2 = this.bindReference(this.parseOwnDefinitionFormat(def, ctx));
    if (node2.isCyclic)
      node2 = withId(node2, ctx.id);
    if (!hasPreassignedId)
      releaseUnusedContextId(ctx.id, node2);
    else
      nodesByRegisteredId[ctx.id] = node2;
    return node2;
  }
  finalize(node2) {
    if (node2.isCyclic && hasUnresolvedContextAlias(node2))
      return node2;
    bootstrapAliasReferences(node2);
    if (!node2.precompilation && !this.resolvedConfig.jitless)
      precompile(node2.references);
    return node2;
  }
};
var SchemaScope = class extends BaseScope {
  parseOwnDefinitionFormat(def, ctx) {
    return parseNode(ctx);
  }
  preparseOwnDefinitionFormat(schema2, opts) {
    return this.preparseNode(schemaKindOf(schema2), schema2, opts);
  }
  preparseOwnAliasEntry(k, v) {
    return [k, v];
  }
  normalizeRootScopeValue(v) {
    return v;
  }
};
var releaseUnusedContextId = (id, node2) => {
  if (node2.id === id)
    nodesByRegisteredId[id] = node2;
  else
    delete nodesByRegisteredId[id];
};
var hasUnresolvedContextAlias = (node2) => node2.references.some((ref) => ref.hasKind("alias") && ref.reference[0] !== "$" && hasArkKind(nodesByRegisteredId[ref.reference], "context"));
var bootstrapAliasReferences = (resolution) => {
  const aliases = resolution.references.filter((node2) => node2.hasKind("alias"));
  for (const aliasNode of aliases) {
    addReferences(aliasNode.referencesById, aliasNode.resolution.referencesById);
    for (const ref of resolution.references) {
      if (aliasNode.id in ref.referencesById)
        addReferences(ref.referencesById, aliasNode.referencesById);
    }
  }
  return resolution;
};
var addReferences = (base, references) => {
  for (const id in references)
    base[id] ??= references[id];
};
var resolutionsToJson = (resolutions) => flatMorph(resolutions, (k, v) => [
  k,
  hasArkKind(v, "root") || hasArkKind(v, "generic") ? v.json : hasArkKind(v, "module") ? resolutionsToJson(v) : throwInternalError(`Unexpected resolution ${printable(v)}`)
]);
var maybeResolveSubalias = (base, name) => {
  const dotIndex = name.indexOf(".");
  if (dotIndex === -1)
    return;
  const dotPrefix = name.slice(0, dotIndex);
  const prefixSchema = base[dotPrefix];
  if (prefixSchema === void 0)
    return;
  if (!hasArkKind(prefixSchema, "module"))
    return throwParseError(writeNonSubmoduleDotMessage(dotPrefix));
  const subalias = name.slice(dotIndex + 1);
  const resolution = prefixSchema[subalias];
  if (resolution === void 0)
    return maybeResolveSubalias(prefixSchema, subalias);
  if (hasArkKind(resolution, "root") || hasArkKind(resolution, "generic"))
    return resolution;
  if (hasArkKind(resolution, "module")) {
    return resolution.root ?? throwParseError(writeMissingSubmoduleAccessMessage(name));
  }
  throwInternalError(`Unexpected resolution for alias '${name}': ${printable(resolution)}`);
};
var schemaScope = (aliases, config) => new SchemaScope(aliases, config);
var rootSchemaScope = new SchemaScope({});
var resolutionsOfModule = ($, typeSet) => {
  const result = {};
  for (const k in typeSet) {
    const v = typeSet[k];
    if (hasArkKind(v, "module")) {
      const innerResolutions = resolutionsOfModule($, v);
      const prefixedResolutions = flatMorph(innerResolutions, (innerK, innerV) => [`${k}.${innerK}`, innerV]);
      Object.assign(result, prefixedResolutions);
    } else if (hasArkKind(v, "root") || hasArkKind(v, "generic"))
      result[k] = v;
    else
      throwInternalError(`Unexpected scope resolution ${printable(v)}`);
  }
  return result;
};
var writeUnresolvableMessage = (token) => `'${token}' is unresolvable`;
var writeNonSubmoduleDotMessage = (name) => `'${name}' must reference a module to be accessed using dot syntax`;
var writeMissingSubmoduleAccessMessage = (name) => `Reference to submodule '${name}' must specify an alias`;
rootSchemaScope.export();
var rootSchema = rootSchemaScope.schema;
var node = rootSchemaScope.node;
var defineSchema = rootSchemaScope.defineSchema;
var genericNode = rootSchemaScope.generic;

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/structure/shared.js
var arrayIndexSource = `^(?:0|[1-9]\\d*)$`;
var arrayIndexMatcher = new RegExp(arrayIndexSource);
var arrayIndexMatcherReference = registeredReference(arrayIndexMatcher);

// node_modules/.pnpm/@ark+schema@0.56.8/node_modules/@ark/schema/out/intrinsic.js
var intrinsicBases = schemaScope({
  bigint: "bigint",
  // since we know this won't be reduced, it can be safely cast to a union
  boolean: [{ unit: false }, { unit: true }],
  false: { unit: false },
  never: [],
  null: { unit: null },
  number: "number",
  object: "object",
  string: "string",
  symbol: "symbol",
  true: { unit: true },
  unknown: {},
  undefined: { unit: void 0 },
  Array,
  Date
}, { prereducedAliases: true }).export();
$ark.intrinsic = { ...intrinsicBases };
var intrinsicRoots = schemaScope({
  integer: {
    domain: "number",
    divisor: 1
  },
  lengthBoundable: ["string", Array],
  key: ["string", "symbol"],
  nonNegativeIntegerString: { domain: "string", pattern: arrayIndexSource }
}, { prereducedAliases: true }).export();
Object.assign($ark.intrinsic, intrinsicRoots);
var intrinsicJson = schemaScope({
  jsonPrimitive: [
    "string",
    "number",
    { unit: true },
    { unit: false },
    { unit: null }
  ],
  jsonObject: {
    domain: "object",
    index: {
      signature: "string",
      value: "$jsonData"
    }
  },
  jsonData: ["$jsonPrimitive", "$jsonObject"]
}, { prereducedAliases: true }).export();
var intrinsic = {
  ...intrinsicBases,
  ...intrinsicRoots,
  ...intrinsicJson,
  emptyStructure: node("structure", {}, { prereduced: true })
};
$ark.intrinsic = { ...intrinsic };

// node_modules/.pnpm/arkregex@0.0.14/node_modules/arkregex/out/regex.js
var regex = ((src, flags) => new RegExp(src, flags));
Object.assign(regex, { as: regex });

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operand/date.js
var isDateLiteral = (value2) => typeof value2 === "string" && value2[0] === "d" && (value2[1] === "'" || value2[1] === '"') && value2[value2.length - 1] === value2[1];
var isValidDate = (d) => d.toString() !== "Invalid Date";
var extractDateLiteralSource = (literal) => literal.slice(2, -1);
var writeInvalidDateMessage = (source) => `'${source}' could not be parsed by the Date constructor`;
var tryParseDate = (source, errorOnFail) => maybeParseDate(source, errorOnFail);
var maybeParseDate = (source, errorOnFail) => {
  const stringParsedDate = new Date(source);
  if (isValidDate(stringParsedDate))
    return stringParsedDate;
  const epochMillis = tryParseNumber(source);
  if (epochMillis !== void 0) {
    const numberParsedDate = new Date(epochMillis);
    if (isValidDate(numberParsedDate))
      return numberParsedDate;
  }
  return errorOnFail ? throwParseError(errorOnFail === true ? writeInvalidDateMessage(source) : errorOnFail) : void 0;
};

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operand/enclosed.js
var regexExecArray = rootSchema({
  proto: "Array",
  sequence: "string",
  required: {
    key: "groups",
    value: ["object", { unit: void 0 }]
  }
});
var parseEnclosed = (s, enclosing) => {
  const enclosed = s.scanner.shiftUntilEscapable(
    untilLookaheadIsClosing[enclosingTokens[enclosing]],
    // within a regex literal, `\\` is a literal backslash and must be
    // preserved verbatim in the pattern source; collapsing it to a single
    // backslash would corrupt the regex (e.g. `\\d` -> `\d` digit class)
    enclosing in enclosingRegexTokens ? Backslash : ""
  );
  if (s.scanner.lookahead === "")
    return s.error(writeUnterminatedEnclosedMessage(enclosed, enclosing));
  s.scanner.shift();
  if (enclosing in enclosingRegexTokens) {
    let regex3;
    try {
      regex3 = new RegExp(enclosed);
    } catch (e) {
      throwParseError(String(e));
    }
    s.root = s.ctx.$.node("intersection", {
      domain: "string",
      pattern: enclosed
    }, { prereduced: true });
    if (enclosing === "x/") {
      s.root = s.ctx.$.node("morph", {
        in: s.root,
        morphs: (s2) => regex3.exec(s2),
        declaredOut: regexExecArray
      });
    }
  } else if (isKeyOf(enclosing, enclosingQuote))
    s.root = s.ctx.$.node("unit", { unit: enclosed });
  else {
    const date = tryParseDate(enclosed, writeInvalidDateMessage(enclosed));
    s.root = s.ctx.$.node("unit", { meta: enclosed, unit: date });
  }
};
var enclosingQuote = {
  "'": 1,
  '"': 1
};
var enclosingChar = {
  "/": 1,
  "'": 1,
  '"': 1
};
var enclosingLiteralTokens = {
  "d'": "'",
  'd"': '"',
  "'": "'",
  '"': '"'
};
var enclosingRegexTokens = {
  "/": "/",
  "x/": "/"
};
var enclosingTokens = {
  ...enclosingLiteralTokens,
  ...enclosingRegexTokens
};
var untilLookaheadIsClosing = {
  "'": (scanner) => scanner.lookahead === `'`,
  '"': (scanner) => scanner.lookahead === `"`,
  "/": (scanner) => scanner.lookahead === `/`
};
var enclosingCharDescriptions = {
  '"': "double-quote",
  "'": "single-quote",
  "/": "forward slash"
};
var writeUnterminatedEnclosedMessage = (fragment, enclosingStart) => `${enclosingStart}${fragment} requires a closing ${enclosingCharDescriptions[enclosingTokens[enclosingStart]]}`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/ast/validate.js
var writePrefixedPrivateReferenceMessage = (name) => `Private type references should not include '#'. Use '${name}' instead.`;
var shallowOptionalMessage = "Optional definitions like 'string?' are only valid as properties in an object or tuple";
var shallowDefaultableMessage = "Defaultable definitions like 'number = 0' are only valid as properties in an object or tuple";

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/tokens.js
var terminatingChars = {
  "<": 1,
  ">": 1,
  "=": 1,
  "|": 1,
  "&": 1,
  ")": 1,
  "[": 1,
  "%": 1,
  ",": 1,
  ":": 1,
  "?": 1,
  "#": 1,
  ...whitespaceChars
};
var lookaheadIsFinalizing = (lookahead, unscanned) => lookahead === ">" ? unscanned[0] === "=" ? (
  // >== would only occur in an expression like Array<number>==5
  // otherwise, >= would only occur as part of a bound like number>=5
  unscanned[1] === "="
) : unscanned.trimStart() === "" || isKeyOf(unscanned.trimStart()[0], terminatingChars) : lookahead === "=" ? unscanned[0] !== "=" : lookahead === "," || lookahead === "?";

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operand/genericArgs.js
var parseGenericArgs = (name, g, s) => _parseGenericArgs(name, g, s, []);
var _parseGenericArgs = (name, g, s, argNodes) => {
  const argState = s.parseUntilFinalizer();
  argNodes.push(argState.root);
  if (argState.finalizer === ">") {
    if (argNodes.length !== g.params.length) {
      return s.error(writeInvalidGenericArgCountMessage(name, g.names, argNodes.map((arg) => arg.expression)));
    }
    return argNodes;
  }
  if (argState.finalizer === ",")
    return _parseGenericArgs(name, g, s, argNodes);
  return argState.error(writeUnclosedGroupMessage(">"));
};
var writeInvalidGenericArgCountMessage = (name, params, argDefs) => `${name}<${params.join(", ")}> requires exactly ${params.length} args (got ${argDefs.length}${argDefs.length === 0 ? "" : `: ${argDefs.join(", ")}`})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operand/unenclosed.js
var parseUnenclosed = (s) => {
  const token = s.scanner.shiftUntilLookahead(terminatingChars);
  if (token === "keyof")
    s.addPrefix("keyof");
  else
    s.root = unenclosedToNode(s, token);
};
var parseGenericInstantiation = (name, g, s) => {
  s.scanner.shiftUntilNonWhitespace();
  const lookahead = s.scanner.shift();
  if (lookahead !== "<")
    return s.error(writeInvalidGenericArgCountMessage(name, g.names, []));
  const parsedArgs = parseGenericArgs(name, g, s);
  return g(...parsedArgs);
};
var unenclosedToNode = (s, token) => maybeParseReference(s, token) ?? maybeParseUnenclosedLiteral(s, token) ?? s.error(token === "" ? s.scanner.lookahead === "#" ? writePrefixedPrivateReferenceMessage(s.shiftedBy(1).scanner.shiftUntilLookahead(terminatingChars)) : writeMissingOperandMessage(s) : writeUnresolvableMessage(token));
var maybeParseReference = (s, token) => {
  if (s.ctx.args?.[token]) {
    const arg = s.ctx.args[token];
    if (typeof arg !== "string")
      return arg;
    return s.ctx.$.node("alias", { reference: arg }, { prereduced: true });
  }
  const resolution = s.ctx.$.maybeResolve(token);
  if (hasArkKind(resolution, "root"))
    return resolution;
  if (resolution === void 0)
    return;
  if (hasArkKind(resolution, "generic"))
    return parseGenericInstantiation(token, resolution, s);
  return throwParseError(`Unexpected resolution ${printable(resolution)}`);
};
var maybeParseUnenclosedLiteral = (s, token) => {
  const maybeNumber = tryParseWellFormedNumber(token);
  if (maybeNumber !== void 0)
    return s.ctx.$.node("unit", { unit: maybeNumber });
  const maybeBigint = tryParseWellFormedBigint(token);
  if (maybeBigint !== void 0)
    return s.ctx.$.node("unit", { unit: maybeBigint });
};
var writeMissingOperandMessage = (s) => {
  const operator = s.previousOperator();
  return operator ? writeMissingRightOperandMessage(operator, s.scanner.unscanned) : writeExpressionExpectedMessage(s.scanner.unscanned);
};
var writeMissingRightOperandMessage = (token, unscanned = "") => `Token '${token}' requires a right operand${unscanned ? ` before '${unscanned}'` : ""}`;
var writeExpressionExpectedMessage = (unscanned) => `Expected an expression${unscanned ? ` before '${unscanned}'` : ""}`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operand/operand.js
var parseOperand = (s) => s.scanner.lookahead === "" ? s.error(writeMissingOperandMessage(s)) : s.scanner.lookahead === "(" ? s.shiftedBy(1).reduceGroupOpen() : s.scanner.lookaheadIsIn(enclosingChar) ? parseEnclosed(s, s.scanner.shift()) : s.scanner.lookaheadIsIn(whitespaceChars) ? parseOperand(s.shiftedBy(1)) : s.scanner.lookahead === "d" ? s.scanner.nextLookahead in enclosingQuote ? parseEnclosed(s, `${s.scanner.shift()}${s.scanner.shift()}`) : parseUnenclosed(s) : s.scanner.lookahead === "x" ? s.scanner.nextLookahead === "/" ? s.shiftedBy(2) && parseEnclosed(s, "x/") : parseUnenclosed(s) : parseUnenclosed(s);

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/reduce/shared.js
var minComparators = {
  ">": true,
  ">=": true
};
var maxComparators = {
  "<": true,
  "<=": true
};
var invertedComparators = {
  "<": ">",
  ">": "<",
  "<=": ">=",
  ">=": "<=",
  "==": "=="
};
var writeOpenRangeMessage = (min, comparator) => `Left bounds are only valid when paired with right bounds (try ...${comparator}${min})`;
var writeUnpairableComparatorMessage = (comparator) => `Left-bounded expressions must specify their limits using < or <= (was ${comparator})`;
var writeMultipleLeftBoundsMessage = (openLimit, openComparator, limit, comparator) => `An expression may have at most one left bound (parsed ${openLimit}${invertedComparators[openComparator]}, ${limit}${invertedComparators[comparator]})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operator/bounds.js
var parseBound = (s, start) => {
  const comparator = shiftComparator(s, start);
  if (s.root.hasKind("unit")) {
    if (typeof s.root.unit === "number") {
      s.reduceLeftBound(s.root.unit, comparator);
      s.unsetRoot();
      return;
    }
    if (s.root.unit instanceof Date) {
      const literal = `d'${s.root.description ?? s.root.unit.toISOString()}'`;
      s.unsetRoot();
      s.reduceLeftBound(literal, comparator);
      return;
    }
  }
  return parseRightBound(s, comparator);
};
var comparatorStartChars = {
  "<": 1,
  ">": 1,
  "=": 1
};
var shiftComparator = (s, start) => s.scanner.lookaheadIs("=") ? `${start}${s.scanner.shift()}` : start;
var getBoundKinds = (comparator, limit, root, boundKind) => {
  if (root.extends($ark.intrinsic.number)) {
    if (typeof limit !== "number") {
      return throwParseError(writeInvalidLimitMessage(comparator, limit, boundKind));
    }
    return comparator === "==" ? ["min", "max"] : comparator[0] === ">" ? ["min"] : ["max"];
  }
  if (root.extends($ark.intrinsic.lengthBoundable)) {
    if (typeof limit !== "number") {
      return throwParseError(writeInvalidLimitMessage(comparator, limit, boundKind));
    }
    return comparator === "==" ? ["exactLength"] : comparator[0] === ">" ? ["minLength"] : ["maxLength"];
  }
  if (root.extends($ark.intrinsic.Date)) {
    return comparator === "==" ? ["after", "before"] : comparator[0] === ">" ? ["after"] : ["before"];
  }
  return throwParseError(writeUnboundableMessage(root.expression));
};
var openLeftBoundToRoot = (leftBound) => ({
  rule: isDateLiteral(leftBound.limit) ? extractDateLiteralSource(leftBound.limit) : leftBound.limit,
  exclusive: leftBound.comparator.length === 1
});
var parseRightBound = (s, comparator) => {
  const previousRoot = s.unsetRoot();
  const previousScannerIndex = s.scanner.location;
  s.parseOperand();
  const limitNode = s.unsetRoot();
  const limitToken = s.scanner.sliceChars(previousScannerIndex, s.scanner.location);
  s.root = previousRoot;
  if (!limitNode.hasKind("unit") || typeof limitNode.unit !== "number" && !(limitNode.unit instanceof Date))
    return s.error(writeInvalidLimitMessage(comparator, limitToken, "right"));
  const limit = limitNode.unit;
  const exclusive = comparator.length === 1;
  const boundKinds = getBoundKinds(comparator, typeof limit === "number" ? limit : limitToken, previousRoot, "right");
  for (const kind of boundKinds) {
    s.constrainRoot(kind, comparator === "==" ? { rule: limit } : { rule: limit, exclusive });
  }
  if (!s.branches.leftBound)
    return;
  if (!isKeyOf(comparator, maxComparators))
    return s.error(writeUnpairableComparatorMessage(comparator));
  const lowerBoundKind = getBoundKinds(s.branches.leftBound.comparator, s.branches.leftBound.limit, previousRoot, "left");
  s.constrainRoot(lowerBoundKind[0], openLeftBoundToRoot(s.branches.leftBound));
  s.branches.leftBound = null;
};
var writeInvalidLimitMessage = (comparator, limit, boundKind) => `Comparator ${boundKind === "left" ? invertedComparators[comparator] : comparator} must be ${boundKind === "left" ? "preceded" : "followed"} by a corresponding literal (was ${limit})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operator/brand.js
var parseBrand = (s) => {
  s.scanner.shiftUntilNonWhitespace();
  const brandName = s.scanner.shiftUntilLookahead(terminatingChars);
  s.root = s.root.brand(brandName);
};

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operator/divisor.js
var parseDivisor = (s) => {
  s.scanner.shiftUntilNonWhitespace();
  const divisorToken = s.scanner.shiftUntilLookahead(terminatingChars);
  const divisor = tryParseInteger(divisorToken, {
    errorOnFail: writeInvalidDivisorMessage(divisorToken)
  });
  if (divisor === 0)
    s.error(writeInvalidDivisorMessage(0));
  s.root = s.root.constrain("divisor", divisor);
};
var writeInvalidDivisorMessage = (divisor) => `% operator must be followed by a non-zero integer literal (was ${divisor})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operator/operator.js
var parseOperator = (s) => {
  const lookahead = s.scanner.shift();
  return lookahead === "" ? s.finalize("") : lookahead === "[" ? s.scanner.shift() === "]" ? s.setRoot(s.root.rawArray()) : s.error(incompleteArrayTokenMessage) : lookahead === "|" ? s.scanner.lookahead === ">" ? s.shiftedBy(1).pushRootToBranch("|>") : s.pushRootToBranch(lookahead) : lookahead === "&" ? s.pushRootToBranch(lookahead) : lookahead === ")" ? s.finalizeGroup() : lookaheadIsFinalizing(lookahead, s.scanner.unscanned) ? s.finalize(lookahead) : isKeyOf(lookahead, comparatorStartChars) ? parseBound(s, lookahead) : lookahead === "%" ? parseDivisor(s) : lookahead === "#" ? parseBrand(s) : lookahead in whitespaceChars ? parseOperator(s) : s.error(writeUnexpectedCharacterMessage(lookahead));
};
var writeUnexpectedCharacterMessage = (char, shouldBe = "") => `'${char}' is not allowed here${shouldBe && ` (should be ${shouldBe})`}`;
var incompleteArrayTokenMessage = `Missing expected ']'`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/shift/operator/default.js
var emptyCollectionDefaults = {
  "[]": () => [],
  "{}": () => ({})
};
var emptyCollectionLiterals = keysOf(emptyCollectionDefaults);
var parseDefault = (s) => {
  const baseNode = s.unsetRoot();
  s.scanner.shiftUntilNonWhitespace();
  const emptyCollection = emptyCollectionLiterals.find((literal) => s.scanner.unscanned.startsWith(literal));
  if (emptyCollection !== void 0) {
    s.scanner.jumpForward(emptyCollection.length);
    return [baseNode, "=", emptyCollectionDefaults[emptyCollection]];
  }
  s.parseOperand();
  const defaultNode = s.unsetRoot();
  if (!defaultNode.hasKind("unit"))
    return s.error(writeNonLiteralDefaultMessage(defaultNode.expression));
  const defaultValue = defaultNode.unit instanceof Date ? () => new Date(defaultNode.unit) : defaultNode.unit;
  return [baseNode, "=", defaultValue];
};
var writeNonLiteralDefaultMessage = (defaultDef) => `Default value '${defaultDef}' must be a literal value`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/string.js
var parseString = (def, ctx) => {
  const aliasResolution = ctx.$.maybeResolveRoot(def);
  if (aliasResolution)
    return aliasResolution;
  if (def.endsWith("[]")) {
    const possibleElementResolution = ctx.$.maybeResolveRoot(def.slice(0, -2));
    if (possibleElementResolution)
      return possibleElementResolution.rawArray();
  }
  const s = new RuntimeState(new Scanner(def), ctx);
  const node2 = fullStringParse(s);
  if (s.finalizer === ">")
    throwParseError(writeUnexpectedCharacterMessage(">"));
  return node2;
};
var fullStringParse = (s) => {
  s.parseOperand();
  let result = parseUntilFinalizer(s).root;
  if (!result) {
    return throwInternalError(`Root was unexpectedly unset after parsing string '${s.scanner.scanned}'`);
  }
  if (s.finalizer === "=")
    result = parseDefault(s);
  else if (s.finalizer === "?")
    result = [result, "?"];
  s.scanner.shiftUntilNonWhitespace();
  if (s.scanner.lookahead) {
    throwParseError(writeUnexpectedCharacterMessage(s.scanner.lookahead));
  }
  return result;
};
var parseUntilFinalizer = (s) => {
  while (s.finalizer === void 0)
    next(s);
  return s;
};
var next = (s) => s.hasRoot() ? s.parseOperator() : s.parseOperand();

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/reduce/dynamic.js
var RuntimeState = class _RuntimeState {
  root;
  branches = {
    prefixes: [],
    leftBound: null,
    intersection: null,
    union: null,
    pipe: null
  };
  finalizer;
  groups = [];
  scanner;
  ctx;
  constructor(scanner, ctx) {
    this.scanner = scanner;
    this.ctx = ctx;
  }
  error(message) {
    return throwParseError(message);
  }
  hasRoot() {
    return this.root !== void 0;
  }
  setRoot(root) {
    this.root = root;
  }
  unsetRoot() {
    const value2 = this.root;
    this.root = void 0;
    return value2;
  }
  constrainRoot(...args2) {
    this.root = this.root.constrain(args2[0], args2[1]);
  }
  finalize(finalizer) {
    if (this.groups.length)
      return this.error(writeUnclosedGroupMessage(")"));
    this.finalizeBranches();
    this.finalizer = finalizer;
  }
  reduceLeftBound(limit, comparator) {
    const invertedComparator = invertedComparators[comparator];
    if (!isKeyOf(invertedComparator, minComparators))
      return this.error(writeUnpairableComparatorMessage(comparator));
    if (this.branches.leftBound) {
      return this.error(writeMultipleLeftBoundsMessage(this.branches.leftBound.limit, this.branches.leftBound.comparator, limit, invertedComparator));
    }
    this.branches.leftBound = {
      comparator: invertedComparator,
      limit
    };
  }
  finalizeBranches() {
    this.assertRangeUnset();
    if (this.branches.pipe) {
      this.pushRootToBranch("|>");
      this.root = this.branches.pipe;
      return;
    }
    if (this.branches.union) {
      this.pushRootToBranch("|");
      this.root = this.branches.union;
      return;
    }
    if (this.branches.intersection) {
      this.pushRootToBranch("&");
      this.root = this.branches.intersection;
      return;
    }
    this.applyPrefixes();
  }
  finalizeGroup() {
    this.finalizeBranches();
    const topBranchState = this.groups.pop();
    if (!topBranchState) {
      return this.error(writeUnmatchedGroupCloseMessage(")", this.scanner.unscanned));
    }
    this.branches = topBranchState;
  }
  addPrefix(prefix) {
    this.branches.prefixes.push(prefix);
  }
  applyPrefixes() {
    while (this.branches.prefixes.length) {
      const lastPrefix = this.branches.prefixes.pop();
      this.root = lastPrefix === "keyof" ? this.root.keyof() : throwInternalError(`Unexpected prefix '${lastPrefix}'`);
    }
  }
  pushRootToBranch(token) {
    this.assertRangeUnset();
    this.applyPrefixes();
    const root = this.root;
    this.root = void 0;
    this.branches.intersection = this.branches.intersection?.rawAnd(root) ?? root;
    if (token === "&")
      return;
    this.branches.union = this.branches.union?.rawOr(this.branches.intersection) ?? this.branches.intersection;
    this.branches.intersection = null;
    if (token === "|")
      return;
    this.branches.pipe = this.branches.pipe?.rawPipeOnce(this.branches.union) ?? this.branches.union;
    this.branches.union = null;
  }
  parseUntilFinalizer() {
    return parseUntilFinalizer(new _RuntimeState(this.scanner, this.ctx));
  }
  parseOperator() {
    return parseOperator(this);
  }
  parseOperand() {
    return parseOperand(this);
  }
  assertRangeUnset() {
    if (this.branches.leftBound) {
      return this.error(writeOpenRangeMessage(this.branches.leftBound.limit, this.branches.leftBound.comparator));
    }
  }
  reduceGroupOpen() {
    this.groups.push(this.branches);
    this.branches = {
      prefixes: [],
      leftBound: null,
      union: null,
      intersection: null,
      pipe: null
    };
  }
  previousOperator() {
    return this.branches.leftBound?.comparator ?? this.branches.prefixes[this.branches.prefixes.length - 1] ?? (this.branches.intersection ? "&" : this.branches.union ? "|" : this.branches.pipe ? "|>" : void 0);
  }
  shiftedBy(count) {
    this.scanner.jumpForward(count);
    return this;
  }
};

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/generic.js
var emptyGenericParameterMessage = "An empty string is not a valid generic parameter name";
var parseGenericParamName = (scanner, result, ctx) => {
  scanner.shiftUntilNonWhitespace();
  const name = scanner.shiftUntilLookahead(terminatingChars);
  if (name === "") {
    if (scanner.lookahead === "" && result.length)
      return result;
    return throwParseError(emptyGenericParameterMessage);
  }
  scanner.shiftUntilNonWhitespace();
  return _parseOptionalConstraint(scanner, name, result, ctx);
};
var extendsToken = "extends ";
var _parseOptionalConstraint = (scanner, name, result, ctx) => {
  scanner.shiftUntilNonWhitespace();
  if (scanner.unscanned.startsWith(extendsToken))
    scanner.jumpForward(extendsToken.length);
  else {
    if (scanner.lookahead === ",")
      scanner.shift();
    result.push(name);
    return parseGenericParamName(scanner, result, ctx);
  }
  const s = parseUntilFinalizer(new RuntimeState(scanner, ctx));
  result.push([name, s.root]);
  return parseGenericParamName(scanner, result, ctx);
};

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/fn.js
var InternalFnParser = class extends Callable {
  constructor($) {
    const parse2 = (...signature) => {
      const returnOperatorIndex = signature.indexOf(":");
      const lastParamIndex = returnOperatorIndex === -1 ? signature.length - 1 : returnOperatorIndex - 1;
      const paramDefs = signature.slice(0, lastParamIndex + 1);
      const paramTuple = $.parse(paramDefs).assertHasKind("intersection");
      let returnType = $.intrinsic.unknown;
      if (returnOperatorIndex !== -1) {
        if (returnOperatorIndex !== signature.length - 2)
          return throwParseError(badFnReturnTypeMessage);
        returnType = $.parse(signature[returnOperatorIndex + 1]);
      }
      return (impl) => new InternalTypedFn(impl, paramTuple, returnType);
    };
    const attach = {
      $,
      raw: parse2
    };
    super(parse2, { attach });
  }
};
var InternalTypedFn = class extends Callable {
  raw;
  params;
  returns;
  expression;
  constructor(raw, params, returns) {
    const typedName = `typed ${raw.name}`;
    const typed = {
      // assign to a key with the expected name to force it to be created that way
      [typedName]: (...args2) => {
        const validatedArgs = params.assert(args2);
        const returned = raw(...validatedArgs);
        return returns.assert(returned);
      }
    }[typedName];
    super(typed);
    this.raw = raw;
    this.params = params;
    this.returns = returns;
    let argsExpression = params.expression;
    if (argsExpression[0] === "[" && argsExpression[argsExpression.length - 1] === "]")
      argsExpression = argsExpression.slice(1, -1);
    else if (argsExpression.endsWith("[]"))
      argsExpression = `...${argsExpression}`;
    this.expression = `(${argsExpression}) => ${returns?.expression ?? "unknown"}`;
  }
};
var badFnReturnTypeMessage = `":" must be followed by exactly one return type e.g:
fn("string", ":", "number")(s => s.length)`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/match.js
var InternalMatchParser = class extends Callable {
  $;
  constructor($) {
    super((...args2) => new InternalChainedMatchParser($)(...args2), {
      bind: $
    });
    this.$ = $;
  }
  in(def) {
    return new InternalChainedMatchParser(this.$, def === void 0 ? void 0 : this.$.parse(def));
  }
  at(key, cases) {
    return new InternalChainedMatchParser(this.$).at(key, cases);
  }
  case(when, then) {
    return new InternalChainedMatchParser(this.$).case(when, then);
  }
};
var InternalChainedMatchParser = class extends Callable {
  $;
  in;
  key;
  branches = [];
  constructor($, In) {
    super((cases) => this.caseEntries(Object.entries(cases).map(([k, v]) => k === "default" ? [k, v] : [this.$.parse(k), v])));
    this.$ = $;
    this.in = In;
  }
  at(key, cases) {
    if (this.key)
      throwParseError(doubleAtMessage);
    if (this.branches.length)
      throwParseError(chainedAtMessage);
    this.key = key;
    return cases ? this.match(cases) : this;
  }
  case(def, resolver) {
    return this.caseEntry(this.$.parse(def), resolver);
  }
  caseEntry(node2, resolver) {
    const wrappableNode = this.key ? this.$.parse({ [this.key]: node2 }) : node2;
    const branch = wrappableNode.pipe(resolver);
    this.branches.push(branch);
    return this;
  }
  match(cases) {
    return this(cases);
  }
  strings(cases) {
    return this.caseEntries(Object.entries(cases).map(([k, v]) => k === "default" ? [k, v] : [this.$.node("unit", { unit: k }), v]));
  }
  caseEntries(entries) {
    for (let i = 0; i < entries.length; i++) {
      const [k, v] = entries[i];
      if (k === "default") {
        if (i !== entries.length - 1) {
          throwParseError(`default may only be specified as the last key of a switch definition`);
        }
        return this.default(v);
      }
      if (typeof v !== "function") {
        return throwParseError(`Value for case "${k}" must be a function (was ${domainOf(v)})`);
      }
      this.caseEntry(k, v);
    }
    return this;
  }
  default(defaultCase) {
    if (typeof defaultCase === "function")
      this.case(intrinsic.unknown, defaultCase);
    const schema2 = {
      branches: this.branches,
      ordered: true
    };
    if (defaultCase === "never" || defaultCase === "assert")
      schema2.meta = { onFail: throwOnDefault };
    const cases = this.$.node("union", schema2);
    if (!this.in)
      return this.$.finalize(cases);
    let inputValidatedCases = this.in.pipe(cases);
    if (defaultCase === "never" || defaultCase === "assert") {
      inputValidatedCases = inputValidatedCases.configureReferences({
        onFail: throwOnDefault
      }, "self");
    }
    return this.$.finalize(inputValidatedCases);
  }
};
var throwOnDefault = (errors) => errors.throw();
var chainedAtMessage = `A key matcher must be specified before the first case i.e. match.at('foo') or match.in<object>().at('bar')`;
var doubleAtMessage = `At most one key matcher may be specified per expression`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/property.js
var parseProperty = (def, ctx) => {
  if (isArray(def)) {
    if (def[1] === "=")
      return [ctx.$.parseOwnDefinitionFormat(def[0], ctx), "=", def[2]];
    if (def[1] === "?")
      return [ctx.$.parseOwnDefinitionFormat(def[0], ctx), "?"];
  }
  return parseInnerDefinition(def, ctx);
};
var invalidOptionalKeyKindMessage = `Only required keys may make their values optional, e.g. { [mySymbol]: ['number', '?'] }`;
var invalidDefaultableKeyKindMessage = `Only required keys may specify default values, e.g. { value: 'number = 0' }`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/objectLiteral.js
var parseObjectLiteral = (def, ctx) => {
  let spread;
  const structure = {};
  const defEntries = stringAndSymbolicEntriesOf(def);
  for (const [k, v] of defEntries) {
    const parsedKey = preparseKey(k);
    if (parsedKey.kind === "spread") {
      if (!isEmptyObject(structure))
        return throwParseError(nonLeadingSpreadError);
      const operand = ctx.$.parseOwnDefinitionFormat(v, ctx);
      if (operand.equals(intrinsic.object))
        continue;
      if (!operand.hasKind("intersection") || // still error on attempts to spread proto nodes like ...Date
      !operand.basis?.equals(intrinsic.object)) {
        return throwParseError(writeInvalidSpreadTypeMessage(operand.expression));
      }
      spread = operand.structure;
      continue;
    }
    if (parsedKey.kind === "undeclared") {
      if (v !== "reject" && v !== "delete" && v !== "ignore")
        throwParseError(writeInvalidUndeclaredBehaviorMessage(v));
      structure.undeclared = v;
      continue;
    }
    const parsedValue = parseProperty(v, ctx);
    const parsedEntryKey = parsedKey;
    if (parsedKey.kind === "required") {
      if (!isArray(parsedValue)) {
        appendNamedProp(structure, "required", {
          key: parsedKey.normalized,
          value: parsedValue
        }, ctx);
      } else {
        appendNamedProp(structure, "optional", parsedValue[1] === "=" ? {
          key: parsedKey.normalized,
          value: parsedValue[0],
          default: parsedValue[2]
        } : {
          key: parsedKey.normalized,
          value: parsedValue[0]
        }, ctx);
      }
      continue;
    }
    if (isArray(parsedValue)) {
      if (parsedValue[1] === "?")
        throwParseError(invalidOptionalKeyKindMessage);
      if (parsedValue[1] === "=")
        throwParseError(invalidDefaultableKeyKindMessage);
    }
    if (parsedKey.kind === "optional") {
      appendNamedProp(structure, "optional", {
        key: parsedKey.normalized,
        value: parsedValue
      }, ctx);
      continue;
    }
    const signature = ctx.$.parseOwnDefinitionFormat(parsedEntryKey.normalized, ctx);
    const normalized = normalizeIndex(signature, parsedValue, ctx.$);
    if (normalized.index)
      structure.index = append(structure.index, normalized.index);
    if (normalized.required)
      structure.required = append(structure.required, normalized.required);
  }
  const structureNode = ctx.$.node("structure", structure);
  return ctx.$.parseSchema({
    domain: "object",
    structure: spread?.merge(structureNode) ?? structureNode
  });
};
var appendNamedProp = (structure, kind, inner, ctx) => {
  structure[kind] = append(
    // doesn't seem like this cast should be necessary
    structure[kind],
    ctx.$.node(kind, inner)
  );
};
var writeInvalidUndeclaredBehaviorMessage = (actual) => `Value of '+' key must be 'reject', 'delete', or 'ignore' (was ${printable(actual)})`;
var nonLeadingSpreadError = "Spread operator may only be used as the first key in an object";
var preparseKey = (key) => typeof key === "symbol" ? { kind: "required", normalized: key } : key[key.length - 1] === "?" ? key[key.length - 2] === Backslash ? { kind: "required", normalized: `${key.slice(0, -2)}?` } : {
  kind: "optional",
  normalized: key.slice(0, -1)
} : key[0] === "[" && key[key.length - 1] === "]" ? { kind: "index", normalized: key.slice(1, -1) } : key[0] === Backslash && key[1] === "[" && key[key.length - 1] === "]" ? { kind: "required", normalized: key.slice(1) } : key === "..." ? { kind: "spread" } : key === "+" ? { kind: "undeclared" } : {
  kind: "required",
  normalized: key === "\\..." ? "..." : key === "\\+" ? "+" : key
};
var writeInvalidSpreadTypeMessage = (def) => `Spread operand must resolve to an object literal type (was ${def})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/tupleExpressions.js
var maybeParseTupleExpression = (def, ctx) => isIndexZeroExpression(def) ? indexZeroParsers[def[0]](def, ctx) : isIndexOneExpression(def) ? indexOneParsers[def[1]](def, ctx) : null;
var parseKeyOfTuple = (def, ctx) => ctx.$.parseOwnDefinitionFormat(def[1], ctx).keyof();
var parseBranchTuple = (def, ctx) => {
  if (def[2] === void 0)
    return throwParseError(writeMissingRightOperandMessage(def[1], ""));
  const l = ctx.$.parseOwnDefinitionFormat(def[0], ctx);
  const r = ctx.$.parseOwnDefinitionFormat(def[2], ctx);
  if (def[1] === "|")
    return ctx.$.node("union", { branches: [l, r] });
  const result = def[1] === "&" ? intersectNodesRoot(l, r, ctx.$) : pipeNodesRoot(l, r, ctx.$);
  if (result instanceof Disjoint)
    return result.throw();
  return result;
};
var parseArrayTuple = (def, ctx) => ctx.$.parseOwnDefinitionFormat(def[0], ctx).rawArray();
var parseMorphTuple = (def, ctx) => {
  if (typeof def[2] !== "function") {
    return throwParseError(writeMalformedFunctionalExpressionMessage("=>", def[2]));
  }
  return ctx.$.parseOwnDefinitionFormat(def[0], ctx).pipe(def[2]);
};
var writeMalformedFunctionalExpressionMessage = (operator, value2) => `${operator === ":" ? "Narrow" : "Morph"} expression requires a function following '${operator}' (was ${typeof value2})`;
var parseNarrowTuple = (def, ctx) => {
  if (typeof def[2] !== "function") {
    return throwParseError(writeMalformedFunctionalExpressionMessage(":", def[2]));
  }
  return ctx.$.parseOwnDefinitionFormat(def[0], ctx).constrain("predicate", def[2]);
};
var parseMetaTuple = (def, ctx) => ctx.$.parseOwnDefinitionFormat(def[0], ctx).configure(def[2], def[3]);
var defineIndexOneParsers = (parsers) => parsers;
var postfixParsers = defineIndexOneParsers({
  "[]": parseArrayTuple,
  "?": () => throwParseError(shallowOptionalMessage)
});
var infixParsers = defineIndexOneParsers({
  "|": parseBranchTuple,
  "&": parseBranchTuple,
  ":": parseNarrowTuple,
  "=>": parseMorphTuple,
  "|>": parseBranchTuple,
  "@": parseMetaTuple,
  // since object and tuple literals parse there via `parseProperty`,
  // they must be shallow if parsed directly as a tuple expression
  "=": () => throwParseError(shallowDefaultableMessage)
});
var indexOneParsers = { ...postfixParsers, ...infixParsers };
var isIndexOneExpression = (def) => indexOneParsers[def[1]] !== void 0;
var defineIndexZeroParsers = (parsers) => parsers;
var indexZeroParsers = defineIndexZeroParsers({
  keyof: parseKeyOfTuple,
  instanceof: (def, ctx) => {
    if (typeof def[1] !== "function") {
      return throwParseError(writeInvalidConstructorMessage(objectKindOrDomainOf(def[1])));
    }
    const branches = def.slice(1).map((ctor) => typeof ctor === "function" ? ctx.$.node("proto", { proto: ctor }) : throwParseError(writeInvalidConstructorMessage(objectKindOrDomainOf(ctor))));
    return branches.length === 1 ? branches[0] : ctx.$.node("union", { branches });
  },
  "===": (def, ctx) => ctx.$.units(def.slice(1))
});
var isIndexZeroExpression = (def) => indexZeroParsers[def[0]] !== void 0;
var writeInvalidConstructorMessage = (actual) => `Expected a constructor following 'instanceof' operator (was ${actual})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/tupleLiteral.js
var parseTupleLiteral = (def, ctx) => {
  let sequences = [{}];
  let i = 0;
  while (i < def.length) {
    let spread = false;
    if (def[i] === "..." && i < def.length - 1) {
      spread = true;
      i++;
    }
    const parsedProperty = parseProperty(def[i], ctx);
    const [valueNode, operator, possibleDefaultValue] = !isArray(parsedProperty) ? [parsedProperty] : parsedProperty;
    i++;
    if (spread) {
      if (!valueNode.extends($ark.intrinsic.Array))
        return throwParseError(writeNonArraySpreadMessage(valueNode.expression));
      sequences = sequences.flatMap((base) => (
        // since appendElement mutates base, we have to shallow-ish clone it for each branch
        valueNode.distribute((branch) => appendSpreadBranch(makeRootAndArrayPropertiesMutable(base), branch))
      ));
    } else {
      sequences = sequences.map((base) => {
        if (operator === "?")
          return appendOptionalElement(base, valueNode);
        if (operator === "=")
          return appendDefaultableElement(base, valueNode, possibleDefaultValue);
        return appendRequiredElement(base, valueNode);
      });
    }
  }
  return ctx.$.parseSchema(sequences.map((sequence) => isEmptyObject(sequence) ? {
    proto: Array,
    exactLength: 0
  } : {
    proto: Array,
    sequence
  }));
};
var appendRequiredElement = (base, element) => {
  if (base.defaultables || base.optionals) {
    return throwParseError(base.variadic ? (
      // e.g. [boolean = true, ...string[], number]
      postfixAfterOptionalOrDefaultableMessage
    ) : requiredPostOptionalMessage);
  }
  if (base.variadic) {
    base.postfix = append(base.postfix, element);
  } else {
    base.prefix = append(base.prefix, element);
  }
  return base;
};
var appendOptionalElement = (base, element) => {
  if (base.variadic)
    return throwParseError(optionalOrDefaultableAfterVariadicMessage);
  base.optionals = append(base.optionals, element);
  return base;
};
var appendDefaultableElement = (base, element, value2) => {
  if (base.variadic)
    return throwParseError(optionalOrDefaultableAfterVariadicMessage);
  if (base.optionals)
    return throwParseError(defaultablePostOptionalMessage);
  base.defaultables = append(base.defaultables, [[element, value2]]);
  return base;
};
var appendVariadicElement = (base, element) => {
  if (base.postfix)
    throwParseError(multipleVariadicMesage);
  if (base.variadic) {
    if (!base.variadic.equals(element)) {
      throwParseError(multipleVariadicMesage);
    }
  } else {
    base.variadic = element.internal;
  }
  return base;
};
var appendSpreadBranch = (base, branch) => {
  const spread = branch.select({ method: "find", kind: "sequence" });
  if (!spread) {
    return appendVariadicElement(base, $ark.intrinsic.unknown);
  }
  if (spread.prefix)
    for (const node2 of spread.prefix)
      appendRequiredElement(base, node2);
  if (spread.optionals)
    for (const node2 of spread.optionals)
      appendOptionalElement(base, node2);
  if (spread.variadic)
    appendVariadicElement(base, spread.variadic);
  if (spread.postfix)
    for (const node2 of spread.postfix)
      appendRequiredElement(base, node2);
  return base;
};
var writeNonArraySpreadMessage = (operand) => `Spread element must be an array (was ${operand})`;
var multipleVariadicMesage = "A tuple may have at most one variadic element";
var requiredPostOptionalMessage = "A required element may not follow an optional element";
var optionalOrDefaultableAfterVariadicMessage = "An optional element may not follow a variadic element";
var defaultablePostOptionalMessage = "A defaultable element may not follow an optional element without a default";

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/parser/definition.js
var parseCache = /* @__PURE__ */ new WeakMap();
var parseInnerDefinition = (def, ctx) => {
  if (typeof def === "string") {
    if (ctx.args && Object.keys(ctx.args).some((k) => def.includes(k))) {
      return parseString(def, ctx);
    }
    let scopeCache = parseCache.get(ctx.$);
    if (!scopeCache) {
      scopeCache = {};
      parseCache.set(ctx.$, scopeCache);
    }
    return scopeCache[def] ??= parseString(def, ctx);
  }
  return hasDomain(def, "object") ? parseObject(def, ctx) : throwParseError(writeBadDefinitionTypeMessage(domainOf(def)));
};
var parseObject = (def, ctx) => {
  const objectKind = objectKindOf(def);
  switch (objectKind) {
    case void 0:
      if (hasArkKind(def, "root"))
        return def;
      if ("~standard" in def)
        return parseStandardSchema(def, ctx);
      return parseObjectLiteral(def, ctx);
    case "Array":
      return parseTuple(def, ctx);
    case "RegExp":
      return ctx.$.node("intersection", {
        domain: "string",
        pattern: def
      }, { prereduced: true });
    case "Function": {
      const resolvedDef = isThunk(def) ? def() : def;
      if (hasArkKind(resolvedDef, "root"))
        return resolvedDef;
      return throwParseError(writeBadDefinitionTypeMessage("Function"));
    }
    default:
      return throwParseError(writeBadDefinitionTypeMessage(objectKind ?? printable(def)));
  }
};
var parseStandardSchema = (def, ctx) => ctx.$.intrinsic.unknown.pipe((v, ctx2) => {
  const result = def["~standard"].validate(v);
  if (!result.issues)
    return result.value;
  for (const { message, path } of result.issues) {
    if (path) {
      if (path.length) {
        ctx2.error({
          problem: uncapitalize(message),
          relativePath: path.map((k) => typeof k === "object" ? k.key : k)
        });
      } else {
        ctx2.error({
          message
        });
      }
    } else {
      ctx2.error({
        message
      });
    }
  }
});
var parseTuple = (def, ctx) => maybeParseTupleExpression(def, ctx) ?? parseTupleLiteral(def, ctx);
var writeBadDefinitionTypeMessage = (actual) => `Type definitions must be strings or objects (was ${actual})`;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/type.js
var InternalTypeParser = class extends Callable {
  constructor($) {
    const attach = Object.assign(
      {
        errors: ArkErrors,
        hkt: Hkt,
        $,
        raw: $.parse,
        module: $.constructor.module,
        scope: $.constructor.scope,
        declare: $.declare,
        define: $.define,
        match: $.match,
        generic: $.generic,
        schema: $.schema,
        // this won't be defined during bootstrapping, but externally always will be
        keywords: $.ambient,
        unit: $.unit,
        enumerated: $.enumerated,
        instanceOf: $.instanceOf,
        valueOf: $.valueOf,
        or: $.or,
        and: $.and,
        merge: $.merge,
        pipe: $.pipe,
        fn: $.fn
      },
      // also won't be defined during bootstrapping
      $.ambientAttachments
    );
    super((...args2) => {
      if (args2.length === 1) {
        return $.parse(args2[0]);
      }
      if (args2.length === 2 && typeof args2[0] === "string" && args2[0][0] === "<" && args2[0][args2[0].length - 1] === ">") {
        const paramString = args2[0].slice(1, -1);
        const params = $.parseGenericParams(paramString, {});
        return new GenericRoot(params, args2[1], $, $, null);
      }
      return $.parse(args2);
    }, {
      attach
    });
  }
};

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/scope.js
var $arkTypeRegistry = $ark;
var InternalScope = class _InternalScope extends BaseScope {
  get ambientAttachments() {
    if (!$arkTypeRegistry.typeAttachments)
      return;
    return this.cacheGetter("ambientAttachments", flatMorph($arkTypeRegistry.typeAttachments, (k, v) => [
      k,
      this.bindReference(v)
    ]));
  }
  preparseOwnAliasEntry(alias, def) {
    const firstParamIndex = alias.indexOf("<");
    if (firstParamIndex === -1) {
      if (hasArkKind(def, "module") || hasArkKind(def, "generic"))
        return [alias, def];
      const qualifiedName = this.name === "ark" ? alias : alias === "root" ? this.name : `${this.name}.${alias}`;
      const config = this.resolvedConfig.keywords?.[qualifiedName];
      if (config)
        def = [def, "@", config];
      return [alias, def];
    }
    if (alias[alias.length - 1] !== ">") {
      throwParseError(`'>' must be the last character of a generic declaration in a scope`);
    }
    const name = alias.slice(0, firstParamIndex);
    const paramString = alias.slice(firstParamIndex + 1, -1);
    return [
      name,
      // use a thunk definition for the generic so that we can parse
      // constraints within the current scope
      () => {
        const params = this.parseGenericParams(paramString, { alias: name });
        const generic2 = parseGeneric(params, def, this);
        return generic2;
      }
    ];
  }
  parseGenericParams(def, opts) {
    return parseGenericParamName(new Scanner(def), [], this.createParseContext({
      ...opts,
      def,
      prefix: "generic"
    }));
  }
  normalizeRootScopeValue(resolution) {
    if (isThunk(resolution) && !hasArkKind(resolution, "generic"))
      return resolution();
    return resolution;
  }
  preparseOwnDefinitionFormat(def, opts) {
    return {
      ...opts,
      def,
      prefix: opts.alias ?? "type"
    };
  }
  parseOwnDefinitionFormat(def, ctx) {
    const isScopeAlias = ctx.alias && ctx.alias in this.aliases;
    if (!isScopeAlias && !ctx.args)
      ctx.args = { this: ctx.id };
    const result = parseInnerDefinition(def, ctx);
    if (isArray(result)) {
      if (result[1] === "=")
        return throwParseError(shallowDefaultableMessage);
      if (result[1] === "?")
        return throwParseError(shallowOptionalMessage);
    }
    return result;
  }
  unit = (value2) => this.units([value2]);
  valueOf = (tsEnum) => this.units(enumValues(tsEnum));
  enumerated = (...values) => this.units(values);
  instanceOf = (ctor) => this.node("proto", { proto: ctor }, { prereduced: true });
  or = (...defs) => this.schema(defs.map((def) => this.parse(def)));
  and = (...defs) => defs.reduce((node2, def) => node2.and(this.parse(def)), this.intrinsic.unknown);
  merge = (...defs) => defs.reduce((node2, def) => node2.merge(this.parse(def)), this.intrinsic.object);
  pipe = (...morphs) => this.intrinsic.unknown.pipe(...morphs);
  fn = new InternalFnParser(this);
  match = new InternalMatchParser(this);
  declare = () => ({
    type: this.type
  });
  define(def) {
    return def;
  }
  type = new InternalTypeParser(this);
  static scope = ((def, config = {}) => new _InternalScope(def, config));
  static module = ((def, config = {}) => _InternalScope.scope(def, config).export());
};
var scope = Object.assign(InternalScope.scope, {
  define: (def) => def
});
var Scope = InternalScope;

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/builtins.js
var MergeHkt = class extends Hkt {
  description = 'merge an object\'s properties onto another like `Merge(User, { isAdmin: "true" })`';
};
var Merge = genericNode(["base", intrinsic.object], ["props", intrinsic.object])((args2) => args2.base.merge(args2.props), MergeHkt);
var arkBuiltins = Scope.module({
  Key: intrinsic.key,
  Merge
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/Array.js
var liftFromHkt = class extends Hkt {
};
var liftFrom = genericNode("element")((args2) => {
  const nonArrayElement = args2.element.exclude(intrinsic.Array);
  const lifted = nonArrayElement.array();
  return nonArrayElement.rawOr(lifted).pipe(liftArray).distribute((branch) => branch.assertHasKind("morph").declareOut(lifted), rootSchema);
}, liftFromHkt);
var arkArray = Scope.module({
  root: intrinsic.Array,
  readonly: "root",
  index: intrinsic.nonNegativeIntegerString,
  liftFrom
}, {
  name: "Array"
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/FormData.js
var value = rootSchema(["string", registry.FileConstructor]);
var parsedFormDataValue = value.rawOr(value.array());
var parsed = rootSchema({
  meta: "an object representing parsed form data",
  domain: "object",
  index: {
    signature: "string",
    value: parsedFormDataValue
  }
});
var arkFormData = Scope.module({
  root: ["instanceof", FormData],
  value,
  parsed,
  parse: rootSchema({
    in: FormData,
    morphs: (data) => {
      const result = {};
      for (const [k, v] of data) {
        if (k in result) {
          const existing = result[k];
          if (typeof existing === "string" || existing instanceof registry.FileConstructor)
            result[k] = [existing, v];
          else
            existing.push(v);
        } else
          result[k] = v;
      }
      return result;
    },
    declaredOut: parsed
  })
}, {
  name: "FormData"
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/TypedArray.js
var TypedArray = Scope.module({
  Int8: ["instanceof", Int8Array],
  Uint8: ["instanceof", Uint8Array],
  Uint8Clamped: ["instanceof", Uint8ClampedArray],
  Int16: ["instanceof", Int16Array],
  Uint16: ["instanceof", Uint16Array],
  Int32: ["instanceof", Int32Array],
  Uint32: ["instanceof", Uint32Array],
  Float32: ["instanceof", Float32Array],
  Float64: ["instanceof", Float64Array],
  BigInt64: ["instanceof", BigInt64Array],
  BigUint64: ["instanceof", BigUint64Array]
}, {
  name: "TypedArray"
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/constructors.js
var omittedPrototypes = {
  Boolean: 1,
  Number: 1,
  String: 1
};
var arkPrototypes = Scope.module({
  ...flatMorph({ ...ecmascriptConstructors, ...platformConstructors }, (k, v) => k in omittedPrototypes ? [] : [k, ["instanceof", v]]),
  Array: arkArray,
  TypedArray,
  FormData: arkFormData
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/number.js
var epoch = rootSchema({
  domain: {
    domain: "number",
    meta: "a number representing a Unix timestamp"
  },
  divisor: {
    rule: 1,
    meta: `an integer representing a Unix timestamp`
  },
  min: {
    rule: -864e13,
    meta: `a Unix timestamp after -8640000000000000`
  },
  max: {
    rule: 864e13,
    meta: "a Unix timestamp before 8640000000000000"
  },
  meta: "an integer representing a safe Unix timestamp"
});
var integer = rootSchema({
  domain: "number",
  divisor: 1
});
var number = Scope.module({
  root: intrinsic.number,
  integer,
  epoch,
  safe: rootSchema({
    domain: {
      domain: "number",
      numberAllowsNaN: false
    },
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER
  }),
  NaN: ["===", Number.NaN],
  Infinity: ["===", Number.POSITIVE_INFINITY],
  NegativeInfinity: ["===", Number.NEGATIVE_INFINITY]
}, {
  name: "number"
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/string.js
var regexStringNode = (regex3, description, jsonSchemaFormat) => {
  const schema2 = {
    domain: "string",
    pattern: {
      rule: regex3.source,
      flags: regex3.flags,
      meta: description
    }
  };
  if (jsonSchemaFormat)
    schema2.meta = { format: jsonSchemaFormat };
  return node("intersection", schema2);
};
var stringIntegerRoot = regexStringNode(wellFormedIntegerMatcher, "a well-formed integer string");
var stringInteger = Scope.module({
  root: stringIntegerRoot,
  parse: rootSchema({
    in: stringIntegerRoot,
    morphs: (s, ctx) => {
      const parsed2 = Number.parseInt(s);
      return Number.isSafeInteger(parsed2) ? parsed2 : ctx.error("an integer in the range Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER");
    },
    declaredOut: intrinsic.integer
  })
}, {
  name: "string.integer"
});
var hex = regexStringNode(/^[\dA-Fa-f]+$/, "hex characters only");
var base58 = regexStringNode(/^[1-9A-HJ-NP-Za-km-z]+$/, "base58-encoded");
var base64 = Scope.module({
  root: regexStringNode(/^(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?$/, "base64-encoded"),
  url: regexStringNode(/^(?:[\w-]{4})*(?:[\w-]{2}(?:==|%3D%3D)?|[\w-]{3}(?:=|%3D)?)?$/, "base64url-encoded")
}, {
  name: "string.base64"
});
var preformattedCapitalize = regexStringNode(/^[A-Z].*$/, "capitalized");
var capitalize2 = Scope.module({
  root: rootSchema({
    in: "string",
    morphs: (s) => s.charAt(0).toUpperCase() + s.slice(1),
    declaredOut: preformattedCapitalize
  }),
  preformatted: preformattedCapitalize
}, {
  name: "string.capitalize"
});
var isLuhnValid = (creditCardInput) => {
  const sanitized = creditCardInput.replace(/[ -]+/g, "");
  let sum = 0;
  let digit;
  let tmpNum;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    digit = sanitized.substring(i, i + 1);
    tmpNum = Number.parseInt(digit, 10);
    if (shouldDouble) {
      tmpNum *= 2;
      sum += tmpNum >= 10 ? tmpNum % 10 + 1 : tmpNum;
    } else
      sum += tmpNum;
    shouldDouble = !shouldDouble;
  }
  return !!(sum % 10 === 0 ? sanitized : false);
};
var creditCardMatcher = /^(?:4\d{12}(?:\d{3,6})?|5[1-5]\d{14}|(222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)\d{12}|6(?:011|5\d\d)\d{12,15}|3[47]\d{13}|3(?:0[0-5]|[68]\d)\d{11}|(?:2131|1800|35\d{3})\d{11}|6[27]\d{14}|^(81\d{14,17}))$/;
var creditCard = rootSchema({
  domain: "string",
  pattern: {
    meta: "a credit card number",
    rule: creditCardMatcher.source
  },
  predicate: {
    meta: "a credit card number",
    predicate: isLuhnValid
  }
});
var iso8601Matcher = /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))(T((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([,.]\d+(?!:))?)?(\17[0-5]\d([,.]\d+)?)?([Zz]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
var isParsableDate = (s) => !Number.isNaN(new Date(s).valueOf());
var parsableDate = rootSchema({
  domain: "string",
  predicate: {
    meta: "a parsable date",
    predicate: isParsableDate
  }
}).assertHasKind("intersection");
var epochRoot = stringInteger.root.internal.narrow((s, ctx) => {
  const n = Number.parseInt(s);
  const out = number.epoch(n);
  if (out instanceof ArkErrors) {
    ctx.errors.merge(out);
    return false;
  }
  return true;
}).configure({
  description: "an integer string representing a safe Unix timestamp"
}, "self").assertHasKind("intersection");
var epoch2 = Scope.module({
  root: epochRoot,
  parse: rootSchema({
    in: epochRoot,
    // parse as a number so the string is treated as milliseconds
    // rather than passed to the Date string parser
    morphs: (s) => new Date(Number.parseInt(s)),
    declaredOut: intrinsic.Date
  })
}, {
  name: "string.date.epoch"
});
var isoRoot = regexStringNode(iso8601Matcher, "an ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) date").internal.assertHasKind("intersection");
var iso = Scope.module({
  root: isoRoot,
  parse: rootSchema({
    in: isoRoot,
    morphs: (s) => new Date(s),
    declaredOut: intrinsic.Date
  })
}, {
  name: "string.date.iso"
});
var stringDate = Scope.module({
  root: parsableDate,
  parse: rootSchema({
    declaredIn: parsableDate,
    in: "string",
    morphs: (s, ctx) => {
      const date = new Date(s);
      if (Number.isNaN(date.valueOf()))
        return ctx.error("a parsable date");
      return date;
    },
    declaredOut: intrinsic.Date
  }),
  iso,
  epoch: epoch2
}, {
  name: "string.date"
});
var email = regexStringNode(
  // considered https://colinhacks.com/essays/reasonable-email-regex but it includes a lookahead
  // which breaks some integrations e.g. fast-check
  // regex based on:
  // https://www.regular-expressions.info/email.html
  /^[\w%+.-]+@[\d.A-Za-z-]+\.[A-Za-z]{2,}$/,
  "an email address",
  "email"
);
var ipv4Segment = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
var ipv4Address = `(${ipv4Segment}[.]){3}${ipv4Segment}`;
var ipv4Matcher = new RegExp(`^${ipv4Address}$`);
var ipv6Segment = "(?:[0-9a-fA-F]{1,4})";
var ipv6Matcher = new RegExp(`^((?:${ipv6Segment}:){7}(?:${ipv6Segment}|:)|(?:${ipv6Segment}:){6}(?:${ipv4Address}|:${ipv6Segment}|:)|(?:${ipv6Segment}:){5}(?::${ipv4Address}|(:${ipv6Segment}){1,2}|:)|(?:${ipv6Segment}:){4}(?:(:${ipv6Segment}){0,1}:${ipv4Address}|(:${ipv6Segment}){1,3}|:)|(?:${ipv6Segment}:){3}(?:(:${ipv6Segment}){0,2}:${ipv4Address}|(:${ipv6Segment}){1,4}|:)|(?:${ipv6Segment}:){2}(?:(:${ipv6Segment}){0,3}:${ipv4Address}|(:${ipv6Segment}){1,5}|:)|(?:${ipv6Segment}:){1}(?:(:${ipv6Segment}){0,4}:${ipv4Address}|(:${ipv6Segment}){1,6}|:)|(?::((?::${ipv6Segment}){0,5}:${ipv4Address}|(?::${ipv6Segment}){1,7}|:)))(%[0-9a-zA-Z.]{1,})?$`);
var ip = Scope.module({
  root: ["v4 | v6", "@", "an IP address"],
  v4: regexStringNode(ipv4Matcher, "an IPv4 address", "ipv4"),
  v6: regexStringNode(ipv6Matcher, "an IPv6 address", "ipv6")
}, {
  name: "string.ip"
});
var jsonStringDescription = "a JSON string";
var writeJsonSyntaxErrorProblem = (error) => {
  if (!(error instanceof SyntaxError))
    throw error;
  return `must be ${jsonStringDescription} (${error})`;
};
var jsonRoot = rootSchema({
  meta: jsonStringDescription,
  domain: "string",
  predicate: {
    meta: jsonStringDescription,
    predicate: (s, ctx) => {
      try {
        JSON.parse(s);
        return true;
      } catch (e) {
        return ctx.reject({
          code: "predicate",
          expected: jsonStringDescription,
          problem: writeJsonSyntaxErrorProblem(e)
        });
      }
    }
  }
});
var parseJson = (s, ctx) => {
  if (s.length === 0) {
    return ctx.error({
      code: "predicate",
      expected: jsonStringDescription,
      actual: "empty"
    });
  }
  try {
    return JSON.parse(s);
  } catch (e) {
    return ctx.error({
      code: "predicate",
      expected: jsonStringDescription,
      problem: writeJsonSyntaxErrorProblem(e)
    });
  }
};
var json = Scope.module({
  root: jsonRoot,
  parse: rootSchema({
    meta: "safe JSON string parser",
    in: "string",
    morphs: parseJson,
    declaredOut: intrinsic.jsonObject
  })
}, {
  name: "string.json"
});
var preformattedLower = regexStringNode(/^[a-z]*$/, "only lowercase letters");
var lower = Scope.module({
  root: rootSchema({
    in: "string",
    morphs: (s) => s.toLowerCase(),
    declaredOut: preformattedLower
  }),
  preformatted: preformattedLower
}, {
  name: "string.lower"
});
var normalizedForms = ["NFC", "NFD", "NFKC", "NFKD"];
var preformattedNodes = flatMorph(normalizedForms, (i, form) => [
  form,
  rootSchema({
    domain: "string",
    predicate: (s) => s.normalize(form) === s,
    meta: `${form}-normalized unicode`
  })
]);
var normalizeNodes = flatMorph(normalizedForms, (i, form) => [
  form,
  rootSchema({
    in: "string",
    morphs: (s) => s.normalize(form),
    declaredOut: preformattedNodes[form]
  })
]);
var NFC = Scope.module({
  root: normalizeNodes.NFC,
  preformatted: preformattedNodes.NFC
}, {
  name: "string.normalize.NFC"
});
var NFD = Scope.module({
  root: normalizeNodes.NFD,
  preformatted: preformattedNodes.NFD
}, {
  name: "string.normalize.NFD"
});
var NFKC = Scope.module({
  root: normalizeNodes.NFKC,
  preformatted: preformattedNodes.NFKC
}, {
  name: "string.normalize.NFKC"
});
var NFKD = Scope.module({
  root: normalizeNodes.NFKD,
  preformatted: preformattedNodes.NFKD
}, {
  name: "string.normalize.NFKD"
});
var normalize = Scope.module({
  root: "NFC",
  NFC,
  NFD,
  NFKC,
  NFKD
}, {
  name: "string.normalize"
});
var numericRoot = regexStringNode(numericStringMatcher, "a well-formed numeric string");
var stringNumeric = Scope.module({
  root: numericRoot,
  parse: rootSchema({
    in: numericRoot,
    morphs: (s) => Number.parseFloat(s),
    declaredOut: intrinsic.number
  })
}, {
  name: "string.numeric"
});
var regexPatternDescription = "a regex pattern";
var regex2 = rootSchema({
  domain: "string",
  predicate: {
    meta: regexPatternDescription,
    predicate: (s, ctx) => {
      try {
        new RegExp(s);
        return true;
      } catch (e) {
        return ctx.reject({
          code: "predicate",
          expected: regexPatternDescription,
          problem: String(e)
        });
      }
    }
  },
  meta: { format: "regex" }
});
var semverMatcher = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][\dA-Za-z-]*))*))?(?:\+([\dA-Za-z-]+(?:\.[\dA-Za-z-]+)*))?$/;
var semver = regexStringNode(semverMatcher, "a semantic version (see https://semver.org/)");
var preformattedTrim = regexStringNode(
  // no leading or trailing whitespace
  /^\S.*\S$|^\S?$/,
  "trimmed"
);
var trim = Scope.module({
  root: rootSchema({
    in: "string",
    morphs: (s) => s.trim(),
    declaredOut: preformattedTrim
  }),
  preformatted: preformattedTrim
}, {
  name: "string.trim"
});
var preformattedUpper = regexStringNode(/^[A-Z]*$/, "only uppercase letters");
var upper = Scope.module({
  root: rootSchema({
    in: "string",
    morphs: (s) => s.toUpperCase(),
    declaredOut: preformattedUpper
  }),
  preformatted: preformattedUpper
}, {
  name: "string.upper"
});
var isParsableUrl = (s) => URL.canParse(s);
var urlRoot = rootSchema({
  domain: "string",
  predicate: {
    meta: "a URL string",
    predicate: isParsableUrl
  },
  // URL.canParse allows a subset of the RFC-3986 URI spec
  // since there is no other serializable validation, best include a format
  meta: { format: "uri" }
});
var url = Scope.module({
  root: urlRoot,
  parse: rootSchema({
    declaredIn: urlRoot,
    in: "string",
    morphs: (s, ctx) => {
      try {
        return new URL(s);
      } catch {
        return ctx.error("a URL string");
      }
    },
    declaredOut: rootSchema(URL)
  })
}, {
  name: "string.url"
});
var uuid = Scope.module({
  // the meta tuple expression ensures the error message does not delegate
  // to the individual branches, which are too detailed
  root: [
    "versioned | nil | max",
    "@",
    { description: "a UUID", format: "uuid" }
  ],
  "#nil": "'00000000-0000-0000-0000-000000000000'",
  "#max": "'ffffffff-ffff-ffff-ffff-ffffffffffff'",
  "#versioned": /^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[1-8][\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/,
  v1: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-1[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv1"),
  v2: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-2[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv2"),
  v3: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-3[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv3"),
  v4: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-4[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv4"),
  v5: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-5[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv5"),
  v6: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-6[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv6"),
  v7: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-7[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv7"),
  v8: regexStringNode(/^[\dA-Fa-f]{8}-[\dA-Fa-f]{4}-8[\dA-Fa-f]{3}-[89ABab][\dA-Fa-f]{3}-[\dA-Fa-f]{12}$/, "a UUIDv8")
}, {
  name: "string.uuid"
});
var string = Scope.module({
  root: intrinsic.string,
  alpha: regexStringNode(/^[A-Za-z]*$/, "only letters"),
  alphanumeric: regexStringNode(/^[\dA-Za-z]*$/, "only letters and digits 0-9"),
  hex,
  base58,
  base64,
  capitalize: capitalize2,
  creditCard,
  date: stringDate,
  digits: regexStringNode(/^\d*$/, "only digits 0-9"),
  email,
  integer: stringInteger,
  ip,
  json,
  lower,
  normalize,
  numeric: stringNumeric,
  regex: regex2,
  semver,
  trim,
  upper,
  url,
  uuid
}, {
  name: "string"
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/ts.js
var arkTsKeywords = Scope.module({
  bigint: intrinsic.bigint,
  boolean: intrinsic.boolean,
  false: intrinsic.false,
  never: intrinsic.never,
  null: intrinsic.null,
  number: intrinsic.number,
  object: intrinsic.object,
  string: intrinsic.string,
  symbol: intrinsic.symbol,
  true: intrinsic.true,
  unknown: intrinsic.unknown,
  undefined: intrinsic.undefined
});
var unknown = Scope.module({
  root: intrinsic.unknown,
  any: intrinsic.unknown
}, {
  name: "unknown"
});
var json2 = Scope.module({
  root: intrinsic.jsonObject,
  stringify: node("morph", {
    in: intrinsic.jsonObject,
    morphs: (data) => JSON.stringify(data),
    declaredOut: intrinsic.string
  })
}, {
  name: "object.json"
});
var object = Scope.module({
  root: intrinsic.object,
  json: json2
}, {
  name: "object"
});
var RecordHkt = class extends Hkt {
  description = 'instantiate an object from an index signature and corresponding value type like `Record("string", "number")`';
};
var Record = genericNode(["K", intrinsic.key], "V")((args2) => ({
  domain: "object",
  index: {
    signature: args2.K,
    value: args2.V
  }
}), RecordHkt);
var PickHkt = class extends Hkt {
  description = 'pick a set of properties from an object like `Pick(User, "name | age")`';
};
var Pick = genericNode(["T", intrinsic.object], ["K", intrinsic.key])((args2) => args2.T.pick(args2.K), PickHkt);
var OmitHkt = class extends Hkt {
  description = 'omit a set of properties from an object like `Omit(User, "age")`';
};
var Omit = genericNode(["T", intrinsic.object], ["K", intrinsic.key])((args2) => args2.T.omit(args2.K), OmitHkt);
var PartialHkt = class extends Hkt {
  description = "make all named properties of an object optional like `Partial(User)`";
};
var Partial = genericNode(["T", intrinsic.object])((args2) => args2.T.partial(), PartialHkt);
var RequiredHkt = class extends Hkt {
  description = "make all named properties of an object required like `Required(User)`";
};
var Required2 = genericNode(["T", intrinsic.object])((args2) => args2.T.required(), RequiredHkt);
var ExcludeHkt = class extends Hkt {
  description = 'exclude branches of a union like `Exclude("boolean", "true")`';
};
var Exclude = genericNode("T", "U")((args2) => args2.T.exclude(args2.U), ExcludeHkt);
var ExtractHkt = class extends Hkt {
  description = 'extract branches of a union like `Extract("0 | false | 1", "number")`';
};
var Extract = genericNode("T", "U")((args2) => args2.T.extract(args2.U), ExtractHkt);
var arkTsGenerics = Scope.module({
  Exclude,
  Extract,
  Omit,
  Partial,
  Pick,
  Record,
  Required: Required2
});

// node_modules/.pnpm/arktype@2.2.9/node_modules/arktype/out/keywords/keywords.js
var ark = scope({
  ...arkTsKeywords,
  ...arkTsGenerics,
  ...arkPrototypes,
  ...arkBuiltins,
  string,
  number,
  object,
  unknown
}, { prereducedAliases: true, name: "ark" });
var keywords = ark.export();
Object.assign($arkTypeRegistry.ambient, keywords);
$arkTypeRegistry.typeAttachments = {
  string: keywords.string.root,
  number: keywords.number.root,
  bigint: keywords.bigint,
  boolean: keywords.boolean,
  symbol: keywords.symbol,
  undefined: keywords.undefined,
  null: keywords.null,
  object: keywords.object.root,
  unknown: keywords.unknown.root,
  false: keywords.false,
  true: keywords.true,
  never: keywords.never,
  arrayIndex: keywords.Array.index,
  Key: keywords.Key,
  Record: keywords.Record,
  Array: keywords.Array.root,
  Date: keywords.Date
};
var type = Object.assign(
  ark.type,
  // assign attachments newly parsed in keywords
  // future scopes add these directly from the
  // registry when their TypeParsers are instantiated
  $arkTypeRegistry.typeAttachments
);
var match = ark.match;
var fn = ark.fn;
var generic = ark.generic;
var schema = ark.schema;
var define = ark.define;
var declare = ark.declare;

// src/config.ts
import { matchesGlob } from "node:path";
var import_yaml = __toESM(require_dist(), 1);

// src/state.ts
import { createHash } from "node:crypto";
var SEVERITIES = ["critical", "major", "minor"];
var FindingSchema = type({
  file: "string",
  line: "number.integer",
  endLine: "number.integer",
  severity: type.enumerated(...SEVERITIES),
  title: "string",
  body: "string",
  /** Exact lines that prove the finding, as `file:line` with the code. */
  evidence: "string[]",
  "rule?": "string"
});
var TrackedSchema = FindingSchema.and({
  fp: "string",
  status: "'open' | 'fixed' | 'dismissed'",
  /** Review comment id of the inline comment, once posted. */
  "commentId?": "number"
});
var StateSchema = type({ head: "string", score: "1 | 2 | 3 | 4 | 5", findings: TrackedSchema.array() });
function score(findings) {
  const critical = findings.filter((f) => f.severity === "critical").length;
  if (critical >= 2) return 1;
  if (critical === 1) return 2;
  if (findings.some((f) => f.severity === "major")) return 3;
  return findings.length > 0 ? 4 : 5;
}
function fingerprint(f) {
  const title = f.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return createHash("sha1").update(`${f.file}
${title}`).digest("hex").slice(0, 12);
}
function sameIssue(a, b) {
  return a.file === b.file && Math.abs(a.line - b.line) <= 2;
}
var lastMarker = (body, marker) => [...body.matchAll(marker)].at(-1)?.[1];
var MARKER = /<!-- reviewpilot:state ([A-Za-z0-9+/=]+) -->/g;
function readState(body) {
  const json3 = lastMarker(body, MARKER);
  if (!json3) return void 0;
  try {
    const out = StateSchema(JSON.parse(Buffer.from(json3, "base64").toString("utf8")));
    return out instanceof type.errors ? void 0 : out;
  } catch {
    return void 0;
  }
}
var STATE_BUDGET = 48e3;
function writeState(state) {
  const open = state.findings.filter((f) => f.status === "open");
  let closed = state.findings.filter((f) => f.status !== "open").slice(-100).map((f) => ({ ...f, body: "", evidence: [] }));
  const steps = [
    (f) => ({ ...f, title: f.title.slice(0, 200), body: f.body.slice(0, 1500), evidence: f.evidence.slice(0, 6).map((e) => e.slice(0, 300)) }),
    (f) => ({ ...f, title: f.title.slice(0, 200), body: f.body.slice(0, 600), evidence: f.evidence.slice(0, 2).map((e) => e.slice(0, 200)) }),
    (f) => ({ ...f, title: f.title.slice(0, 160), body: f.body.slice(0, 300), evidence: f.evidence.slice(0, 1).map((e) => e.slice(0, 160)) }),
    (f) => ({ ...f, title: f.title.slice(0, 120), body: "", evidence: [] }),
    (f) => ({ ...f, title: f.title.slice(0, 60), body: "", evidence: [] })
  ];
  const encode = (findings) => Buffer.from(JSON.stringify({ ...state, findings })).toString("base64");
  let out = "";
  for (const step of steps) {
    out = encode([...open.map(step), ...closed]);
    if (out.length <= STATE_BUDGET) break;
  }
  let kept = open.map(steps.at(-1) ?? ((f) => f));
  while (out.length > STATE_BUDGET && closed.length) {
    closed = closed.slice(Math.ceil(closed.length / 2));
    out = encode([...kept, ...closed]);
  }
  while (out.length > STATE_BUDGET && kept.length) {
    kept = kept.slice(Math.ceil(kept.length / 10));
    out = encode(kept);
  }
  return `<!-- reviewpilot:state ${out} -->`;
}
var SUMMARY_TAG = "<!-- reviewpilot:summary -->";
var findingTag = (fp) => `<!-- reviewpilot:fp=${fp} -->`;
var FINDING_TAG = /<!-- reviewpilot:fp=([0-9a-f]{12}) -->/g;

// src/config.ts
var Severity = type.enumerated(...SEVERITIES);
var Rule = type({
  id: "string",
  rule: "string",
  "severity?": Severity,
  "paths?": "string[]"
});
var FileConfig = type({
  "model?": {
    "name?": "string",
    "verify?": "string",
    "effort?": "'none' | 'low' | 'medium' | 'high'"
  },
  "review?": {
    "ignore?": "string[]",
    "min_severity?": Severity,
    "max_findings?": "0 < number.integer <= 50"
  },
  "rules?": Rule.array(),
  "instructions?": "string",
  "context_files?": "string[]"
  // A typo like `min_severty` must be reported, not silently ignored.
}).onDeepUndeclaredKey("reject");
var DEFAULTS = {
  model: { name: "z-ai/glm-5.3-flash", verify: "z-ai/glm-5.3-flash", effort: "medium" },
  review: {
    ignore: [
      "**/pnpm-lock.yaml",
      "**/package-lock.json",
      "**/yarn.lock",
      "**/bun.lock",
      "**/Cargo.lock",
      "**/*.min.js",
      "**/*.map",
      "**/dist/**",
      "**/build/**",
      "**/__snapshots__/**",
      "**/*.png",
      "**/*.jpg",
      "**/*.svg",
      "**/*.ico",
      "**/*.lottie"
    ],
    min_severity: "minor",
    max_findings: 20
  },
  rules: [],
  instructions: "",
  context_files: ["AGENTS.md", "CLAUDE.md"]
};
function loadConfig(text) {
  if (!text?.trim()) return { config: DEFAULTS };
  let raw;
  try {
    raw = (0, import_yaml.parse)(text);
  } catch (e) {
    return { config: DEFAULTS, warning: `.reviewpilot.yml is not valid YAML, using defaults: ${String(e)}` };
  }
  const file = FileConfig(raw ?? {});
  if (file instanceof type.errors) {
    return { config: DEFAULTS, warning: `.reviewpilot.yml has errors, using defaults: ${file.summary}` };
  }
  return {
    config: {
      model: { ...DEFAULTS.model, ...file.model },
      review: {
        ...DEFAULTS.review,
        ...file.review,
        ignore: [...DEFAULTS.review.ignore, ...file.review?.ignore ?? []]
      },
      rules: file.rules ?? DEFAULTS.rules,
      instructions: file.instructions ?? DEFAULTS.instructions,
      context_files: file.context_files ?? DEFAULTS.context_files
    }
  };
}
var ignored = (config, path) => config.review.ignore.some((glob) => matchesGlob(path, glob));
var rulesFor = (config, paths) => config.rules.filter((r) => !r.paths?.length || paths.some((p) => r.paths?.some((g) => matchesGlob(p, g))));

// src/diff.ts
var HUNK = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
var ESCAPES = { n: "\n", t: "	", '"': '"', "\\": "\\" };
var unquote = (path) => path.startsWith('"') && path.endsWith('"') ? path.slice(1, -1).replace(/\\(.)/g, (_, c) => ESCAPES[c] ?? c) : path;
function parseDiff(raw) {
  const files = [];
  let file;
  let out = [];
  let line = 0;
  let hunk = -1;
  const flush = () => {
    if (file) files.push({ ...file, numbered: out.join("\n") });
  };
  for (const text of raw.split("\n")) {
    if (text.startsWith("diff --git ")) {
      flush();
      const path = text.match(/ b\/(.+)$/)?.[1] ?? "";
      file = { path, status: "modified", commentable: /* @__PURE__ */ new Set(), hunkOf: /* @__PURE__ */ new Map(), numbered: "" };
      out = [];
      hunk = -1;
      continue;
    }
    if (!file) continue;
    if (text.startsWith("new file mode")) file.status = "added";
    else if (text.startsWith("deleted file mode")) file.status = "deleted";
    else if (text.startsWith("rename to ")) {
      file.status = "renamed";
      file.path = unquote(text.slice("rename to ".length));
    } else if (hunk < 0 && (text.startsWith("+++ b/") || text.startsWith('+++ "b/'))) {
      const raw2 = text.slice("+++ ".length);
      file.path = unquote(raw2).replace(/^b\//, "");
    } else if (hunk < 0 && (text.startsWith("+++ ") || text.startsWith("--- ") || text.startsWith("index "))) {
      continue;
    } else if (text.startsWith("@@")) {
      const start = text.match(HUNK)?.[1];
      line = start ? Number(start) : 0;
      hunk += 1;
      out.push(text);
    } else if (hunk >= 0) {
      const mark = text[0];
      if (mark === "+" || mark === " ") {
        file.commentable.add(line);
        file.hunkOf.set(line, hunk);
        out.push(`${String(line).padStart(5)} ${mark === "+" ? "+" : " "} ${text.slice(1)}`);
        line += 1;
      } else if (mark === "-") {
        out.push(`      - ${text.slice(1)}`);
      }
    }
  }
  flush();
  return files;
}
function anchor(file, start, end) {
  if (!file) return void 0;
  const last = [end, start].find((n) => file.commentable.has(n));
  if (last === void 0) return void 0;
  const first = start < last && file.commentable.has(start) && file.hunkOf.get(start) === file.hunkOf.get(last) ? start : void 0;
  return first === void 0 ? { line: last } : { line: last, startLine: first };
}

// src/git.ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var exec = promisify(execFile);
var git = async (root, ...args2) => (await exec("git", args2, { cwd: root, maxBuffer: 256 * 1024 * 1024 })).stdout;
async function checkoutPr(root, pr, head, baseSha) {
  if ((await git(root, "rev-parse", "--is-shallow-repository")).trim() === "true") {
    await git(root, "fetch", "--no-tags", "--unshallow", "origin");
  }
  await git(root, "fetch", "--no-tags", "origin", `+refs/pull/${pr}/head:refs/reviewpilot/head`);
  await git(root, "checkout", "--quiet", "--detach", head);
  return (await git(root, "merge-base", baseSha, head)).trim();
}
var diff = (root, from, to, ignore) => git(
  root,
  "-c",
  "core.quotePath=off",
  "diff",
  "--no-color",
  "--no-ext-diff",
  "-M",
  "--unified=5",
  from,
  to,
  "--",
  ".",
  ...ignore.map((g) => `:(glob,exclude)${g}`)
);
var readAt = (root, ref, path) => git(root, "show", `${ref}:${path}`).catch((e) => {
  if (/does not exist in|exists on disk, but not in/.test(e.stderr ?? "")) return void 0;
  throw e;
});
async function fetchRef(root, branch) {
  await git(root, "fetch", "--no-tags", "origin", `+refs/heads/${branch}:refs/reviewpilot/default`);
  return "refs/reviewpilot/default";
}

// src/github.ts
var User = type({ login: "string" });
var Pr = type({
  number: "number",
  state: "'open' | 'closed'",
  draft: "boolean",
  title: "string",
  body: "string | null",
  user: User,
  head: { sha: "string" },
  base: { ref: "string", sha: "string", repo: { default_branch: "string" } }
});
var IssueComment = type({ id: "number", node_id: "string", body: "string", user: User.or("null") });
var ReviewComment = type({ id: "number", body: "string", "in_reply_to_id?": "number", user: User.or("null") });
var Created = type({ id: "number" });
var GraphQlEnvelope = type({ "errors?": type({ message: "string" }).array(), "data?": "unknown" });
var ThreadsData = type({
  data: {
    repository: {
      pullRequest: {
        reviewThreads: {
          nodes: type({
            id: "string",
            isResolved: "boolean",
            resolvedBy: User.or("null"),
            comments: {
              nodes: type({
                id: "string",
                databaseId: "number | null",
                body: "string",
                authorAssociation: "string",
                author: User.or("null")
              }).array()
            }
          }).array()
        }
      }
    }
  }
});
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function createGitHub(token, repo) {
  const api = process.env.GITHUB_API_URL ?? "https://api.github.com";
  async function call(schema2, method, path, body) {
    const idempotent = method !== "POST" || path === "/graphql";
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${api}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "reviewpilot",
          ...body ? { "Content-Type": "application/json" } : {}
        },
        ...body ? { body: JSON.stringify(body) } : {},
        signal: AbortSignal.timeout(3e4)
      }).catch((e) => e instanceof Error ? e : new Error(String(e)));
      const status = res instanceof Error ? 0 : res.status;
      const retryable = status === 429 || idempotent && (status === 0 || status >= 500);
      if (retryable && attempt < 3) {
        await sleep(2 ** attempt * 1e3);
        continue;
      }
      if (res instanceof Error) throw new Error(`GitHub ${method} ${path}: ${res.message}`);
      if (!res.ok) throw new Error(`GitHub ${method} ${path}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      try {
        return schema2.assert(res.status === 204 ? void 0 : await res.json());
      } catch (e) {
        throw new Error(`GitHub ${method} ${path}: unexpected response, ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  async function all(schema2, path) {
    const page = schema2.array();
    const out = [];
    for (let n = 1; n <= 30; n++) {
      const batch = await call(page, "GET", `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${n}`);
      out.push(...batch);
      if (batch.length < 100) break;
    }
    return out;
  }
  async function graphql(schema2, query, variables) {
    const res = await call(GraphQlEnvelope, "POST", "/graphql", { query, variables });
    if (res.errors?.length) throw new Error(`GitHub GraphQL: ${res.errors.map((e) => e.message).join("; ")}`);
    try {
      return schema2.assert(res);
    } catch (e) {
      throw new Error(`GitHub GraphQL: unexpected response, ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const [owner, name] = repo.split("/");
  const r = `/repos/${repo}`;
  const done = type("unknown");
  return {
    pr: (n) => call(Pr, "GET", `${r}/pulls/${n}`),
    issueComments: (n) => all(IssueComment, `${r}/issues/${n}/comments`),
    reviewComments: (n) => all(ReviewComment, `${r}/pulls/${n}/comments`),
    comment: (n, body) => call(Created, "POST", `${r}/issues/${n}/comments`, { body }),
    editComment: (id, body) => call(Created, "PATCH", `${r}/issues/comments/${id}`, { body }),
    react: (commentId, content) => call(done, "POST", `${r}/issues/comments/${commentId}/reactions`, { content }),
    reply: (n, commentId, body) => call(Created, "POST", `${r}/pulls/${n}/comments/${commentId}/replies`, { body }),
    review: (n, commitId, comments) => call(Created, "POST", `${r}/pulls/${n}/reviews`, {
      commit_id: commitId,
      event: "COMMENT",
      comments: comments.map((c) => ({
        path: c.path,
        line: c.line,
        side: "RIGHT",
        ...c.start_line ? { start_line: c.start_line, start_side: "RIGHT" } : {},
        body: c.body
      }))
    }),
    /** Removes an old summary; if deleting is not allowed, collapses it as outdated instead. */
    async retire(comment) {
      await call(done, "DELETE", `${r}/issues/comments/${comment.id}`).catch(
        () => graphql(done, "mutation($id:ID!){minimizeComment(input:{subjectId:$id,classifier:OUTDATED}){minimizedComment{isMinimized}}}", { id: comment.node_id })
      );
    },
    async threads(n) {
      const query = `query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name){pullRequest(number:$n){
        reviewThreads(first:100){nodes{id isResolved resolvedBy{login} comments(first:100){nodes{id databaseId body authorAssociation author{login}}}}}}}}`;
      const res = await graphql(ThreadsData, query, { owner, name, n });
      return res.data.repository.pullRequest.reviewThreads.nodes.map((t) => ({
        id: t.id,
        resolved: t.isResolved,
        resolvedBy: t.resolvedBy?.login ?? "",
        comments: t.comments.nodes.map((c) => ({
          id: c.id,
          databaseId: c.databaseId,
          body: c.body,
          author: c.author?.login ?? "",
          association: c.authorAssociation
        }))
      }));
    },
    /**
     * Closes a fixed finding: collapses its comment as outdated, then resolves the thread.
     * GitHub only lets an App resolve threads with Contents write, which a reviewer should
     * not need, so without it the thread stays open but collapsed. Returns whether it resolved.
     */
    async close(thread) {
      const root = thread.comments[0];
      if (root) {
        await graphql(done, "mutation($id:ID!){minimizeComment(input:{subjectId:$id,classifier:OUTDATED}){minimizedComment{isMinimized}}}", { id: root.id });
      }
      return graphql(done, "mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{id}}}", { id: thread.id }).then(
        () => true,
        (e) => {
          if (/not accessible by integration/i.test(String(e))) return false;
          throw e;
        }
      );
    }
  };
}

// src/llm.ts
var Completion = type({
  "choices?": type({
    "message?": {
      "content?": "string | null",
      "tool_calls?": type({ id: "string", type: "'function'", function: { name: "string", arguments: "string" } }).array()
    }
  }).array(),
  "usage?": { "prompt_tokens?": "number", "completion_tokens?": "number" },
  "error?": { "message?": "string" }
});
var sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
function createLlm(opts) {
  const usage = { prompt: 0, completion: 0, calls: 0 };
  const url2 = `${opts.baseUrl.replace(/\/$/, "")}/chat/completions`;
  let sendEffort = opts.effort !== "none";
  async function chat(messages, tools, force, deadline) {
    const left = () => deadline === void 0 ? Infinity : deadline - Date.now();
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(url2, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${opts.apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "reviewpilot/0.1"
        },
        body: JSON.stringify({
          model: opts.model,
          messages,
          tools,
          tool_choice: force ? { type: "function", function: { name: force } } : "auto",
          // "none" leaves the parameter out, for providers that reject it.
          ...sendEffort ? { reasoning_effort: opts.effort } : {}
        }),
        // At least 60s even past the deadline: the forced final call must still get an answer.
        signal: AbortSignal.timeout(Math.max(6e4, Math.min(opts.timeoutMs ?? 24e4, left())))
      }).catch((e) => ({ ok: false, status: 0, error: e }));
      const retryable = !res.ok && (res.status === 0 || res.status === 429 || res.status >= 500);
      if (retryable && attempt < 4 && left() > 15e3) {
        const header = "headers" in res ? res.headers.get("retry-after") : null;
        const wait = header ? Number(header) * 1e3 || Date.parse(header) - Date.now() : NaN;
        await sleep2(Number.isFinite(wait) && wait > 0 ? Math.min(wait, 6e4) : 2 ** attempt * 3e3);
        continue;
      }
      if (!res.ok) {
        const detail = "text" in res ? await res.text() : String(res.error);
        if (res.status === 400 && sendEffort && /reasoning/i.test(detail) && attempt < 4) {
          sendEffort = false;
          continue;
        }
        throw new Error(`${opts.model}: HTTP ${res.status} ${detail.slice(0, 300)}`);
      }
      const text = await res.text();
      let json3;
      try {
        json3 = JSON.parse(text);
      } catch {
        json3 = void 0;
      }
      const parsed2 = Completion(json3);
      const data = parsed2 instanceof type.errors ? void 0 : parsed2;
      if (!data && attempt < 4 && left() > 15e3) {
        await sleep2(2 ** attempt * 3e3);
        continue;
      }
      if (!data) throw new Error(`${opts.model}: response is not a chat completion: ${text.slice(0, 200)}`);
      const message = data.choices?.[0]?.message;
      if (!message) throw new Error(`${opts.model}: empty response ${data.error?.message ?? ""}`);
      usage.calls += 1;
      usage.prompt += data.usage?.prompt_tokens ?? 0;
      usage.completion += data.usage?.completion_tokens ?? 0;
      return {
        role: "assistant",
        content: message.content ?? null,
        ...message.tool_calls?.length ? { tool_calls: message.tool_calls } : {}
      };
    }
  }
  return { model: opts.model, chat, usage };
}

// src/log.ts
import { appendFile } from "node:fs/promises";
var seconds = (ms) => ms >= 6e4 ? `${Math.floor(ms / 6e4)}m ${Math.floor(ms % 6e4 / 1e3)}s` : `${(ms / 1e3).toFixed(1)}s`;
function createLog(actions) {
  const phases = [];
  const safe = (text) => actions ? text.replace(/^::/gm, ": :") : text;
  return {
    phases,
    line: (text) => console.log(safe(text)),
    warn: (text) => console.log(actions ? `::warning::${safe(text).replace(/\n/g, " ")}` : `warning: ${text}`),
    /** Runs one phase inside a log group and records how long it took. */
    async phase(name, fn2) {
      const start = performance.now();
      console.log(actions ? `::group::${name}` : `> ${name}`);
      try {
        return await fn2();
      } finally {
        const ms = Math.round(performance.now() - start);
        phases.push({ name, ms });
        if (actions) console.log("::endgroup::");
        console.log(`${name}: ${seconds(ms)}`);
      }
    },
    /** Appends the run report to the Actions job summary, when there is one. */
    async report(facts) {
      const file = process.env.GITHUB_STEP_SUMMARY;
      if (!file) return;
      const rows = phases.map((p) => `| ${p.name} | ${seconds(p.ms)} |`).join("\n");
      const total = phases.reduce((sum, p) => sum + p.ms, 0);
      await appendFile(
        file,
        [
          `### ReviewPilot run: ${facts.score}/5`,
          "",
          `${facts.findings.new} new, ${facts.findings.open} open, ${facts.findings.fixed} fixed. ${facts.verified} of ${facts.candidates} candidates verified.`,
          "",
          "| Phase | Time |",
          "| --- | --- |",
          rows,
          `| **Total** | **${seconds(total)}** |`,
          "",
          `Model \`${facts.model}\`: ${facts.usage.calls} calls, ${facts.usage.prompt.toLocaleString("en")} input and ${facts.usage.completion.toLocaleString("en")} output tokens.`,
          ""
        ].join("\n")
      );
    }
  };
}

// src/render.ts
var ORDER = { critical: 0, major: 1, minor: 2 };
var bySeverity = (a, b) => ORDER[a.severity] - ORDER[b.severity];
var clean = (text) => text.replace(/<!--|-->/g, "");
var flat = (text) => clean(text).replace(/\s+/g, " ").trim();
var linkText = (text) => flat(text).replace(/[[\]()]/g, "");
var fence = (lines) => `\`\`\`text
${lines.join("\n").replaceAll("```", "'''")}
\`\`\``;
function inlineBody(f) {
  const tag = f.rule ? ` \xB7 rule \`${linkText(f.rule)}\`` : "";
  return [
    `**${flat(f.title)}** \xB7 ${f.severity}${tag}`,
    "",
    clean(f.body),
    "",
    `<details><summary>Evidence</summary>

${fence(f.evidence.map(clean))}
</details>`,
    findingTag(f.fp)
  ].join("\n");
}
function summaryBody(state, prev, outside, run2) {
  const open = state.findings.filter((f) => f.status === "open").sort(bySeverity);
  const fixed = state.findings.filter((f) => f.status === "fixed" && prev?.findings.some((p) => p.fp === f.fp && p.status === "open"));
  const fresh = open.filter((f) => !prev?.findings.some((p) => p.fp === f.fp && p.status === "open"));
  const link = (f) => `[${linkText(f.file.split("/").pop() ?? f.file)}:${f.line}](https://github.com/${run2.repo}/blob/${run2.head}/${f.file.split("/").map(encodeURIComponent).join("/")}#L${f.line})`;
  const lines = [`## ReviewPilot: ${state.score}/5`];
  if (prev && prev.head !== state.head) {
    const move = prev.score === state.score ? `${state.score}/5` : `${prev.score}/5 \u2192 ${state.score}/5`;
    lines.push(`<sub>Since ${prev.head.slice(0, 7)}: ${move} \xB7 ${fixed.length} fixed \xB7 ${fresh.length} new \xB7 ${open.length} open</sub>`);
  }
  lines.push("");
  if (open.length) {
    lines.push("| Severity | Finding | Where |", "| --- | --- | --- |");
    for (const f of open.filter((o) => !outside.includes(o))) lines.push(`| ${f.severity} | ${flat(f.title).replaceAll("|", "\\|")} | ${link(f)} |`);
  } else {
    lines.push("No verified issues.");
  }
  if (outside.length) {
    lines.push("", "**Outside the changed lines**", "");
    for (const f of outside) lines.push(`- **${flat(f.title)}** (${link(f)}, ${f.severity}): ${flat(f.body)}`);
  }
  if (fixed.length) {
    lines.push("", `<details><summary>Fixed since last review (${fixed.length})</summary>
`);
    for (const f of fixed) lines.push(`- ${flat(f.title)} (${f.file}:${f.line})`);
    lines.push("\n</details>");
  }
  if (run2.warning) lines.push("", `> ${run2.warning}`);
  const time = run2.seconds >= 60 ? `${Math.floor(run2.seconds / 60)}m ${run2.seconds % 60}s` : `${run2.seconds}s`;
  lines.push(
    "",
    `<sub>Reviewed ${run2.head.slice(0, 7)} with ${run2.model} \xB7 ${run2.files} files \xB7 ${run2.candidates} candidates, ${run2.verified} checks \xB7 ${time}. Every finding was re-checked against the code before posting.</sub>`,
    SUMMARY_TAG,
    writeState(state)
  );
  return lines.join("\n");
}
var progressBody = (head, prev) => [
  `## ReviewPilot: reviewing ${head.slice(0, 7)}`,
  "",
  "Reading the diff and the code around it, then re-checking each finding. This usually takes a few minutes.",
  SUMMARY_TAG,
  prev ?? ""
].join("\n");

// src/tools.ts
import { execFile as execFile2 } from "node:child_process";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";
import { promisify as promisify2 } from "node:util";
var run = promisify2(execFile2);
var MAX_LINES = 250;
var MAX_MATCHES = 150;
var MAX_ENTRIES = 300;
var MAX_BYTES = 2 * 1024 * 1024;
var TOOL_SPECS = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a file from the repository at the PR head, with line numbers. Use it to check callers, types, guards and anything the diff does not show. Reads up to 250 lines per call.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Repository-relative path" },
          start_line: { type: "integer", description: "First line, 1-based (default 1)" },
          end_line: { type: "integer", description: "Last line (default start_line + 249)" }
        },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search",
      description: "Search the repository with a regular expression (git grep -E). Use it to find definitions, callers and other uses of a name.",
      parameters: {
        type: "object",
        properties: {
          pattern: { type: "string", description: "Extended regular expression" },
          path: { type: "string", description: "Optional directory or glob to limit the search, e.g. 'src' or '**/*.ts'" }
        },
        required: ["pattern"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_dir",
      description: "List a directory in the repository.",
      parameters: {
        type: "object",
        properties: { path: { type: "string", description: "Repository-relative directory, '.' for the root" } },
        required: ["path"]
      }
    }
  }
];
async function inside(root, path) {
  const real = await realpath(resolve(root, path)).catch(() => void 0);
  if (!real) return void 0;
  const rel = relative(await realpath(root), real);
  if (rel.startsWith("..") || rel.split(sep)[0] === ".git") return void 0;
  return real;
}
var num = (v, fallback) => typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : fallback;
var str = (v) => typeof v === "string" ? v : "";
async function runTool(root, name, args2) {
  try {
    if (name === "read_file") {
      const full = await inside(root, str(args2.path));
      if (!full) return "Error: no such file in the repository.";
      if ((await stat(full)).size > MAX_BYTES) return `${str(args2.path)} is larger than 2 MB, which is too big to read; use search instead.`;
      const text = await readFile(full, "utf8");
      const lines = (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
      const start = Math.max(1, num(args2.start_line, 1));
      if (start > lines.length) return `${str(args2.path)} has only ${lines.length} lines.`;
      const end = Math.max(start, Math.min(lines.length, num(args2.end_line, start + MAX_LINES - 1), start + MAX_LINES - 1));
      const body = lines.slice(start - 1, end).map((text2, i) => `${String(start + i).padStart(5)}  ${text2.length > 2e3 ? `${text2.slice(0, 2e3)} [line cut]` : text2}`).join("\n").slice(0, 8e4);
      const more = end < lines.length ? `
[lines ${end + 1}-${lines.length} not shown]` : "";
      return `${str(args2.path)} (${lines.length} lines)
${body}${more}`;
    }
    if (name === "search") {
      const pattern = str(args2.pattern);
      if (!pattern) return "Error: empty pattern.";
      const scope2 = str(args2.path);
      if (scope2 && (scope2.startsWith("/") || scope2.startsWith(":") || scope2.split("/").includes(".."))) {
        return "Error: path must be repository-relative.";
      }
      const pathspec = scope2.includes("*") ? `:(glob)${scope2}` : scope2;
      const argv = ["grep", "-n", "-I", "-E", "--no-color", "-e", pattern, "--", ...pathspec ? [pathspec] : []];
      const { stdout } = await run("git", argv, { cwd: root, maxBuffer: 8 * 1024 * 1024 }).catch(
        (e) => e.code === 1 ? { stdout: "" } : Promise.reject(e)
      );
      const hits = stdout.split("\n").filter(Boolean);
      if (!hits.length) return "No matches.";
      const shown = hits.slice(0, MAX_MATCHES).map((h) => h.length > 300 ? `${h.slice(0, 300)}...` : h);
      return `${shown.join("\n")}${hits.length > MAX_MATCHES ? `
[${hits.length - MAX_MATCHES} more matches not shown]` : ""}`;
    }
    if (name === "list_dir") {
      const full = await inside(root, str(args2.path) || ".");
      if (!full || !(await stat(full)).isDirectory()) return "Error: not a directory in the repository.";
      const entries = (await readdir(full, { withFileTypes: true })).filter((e) => e.name !== ".git").map((e) => e.isDirectory() ? `${e.name}/` : e.name).sort();
      const more = entries.length > MAX_ENTRIES ? `
[${entries.length - MAX_ENTRIES} more entries not shown]` : "";
      return entries.slice(0, MAX_ENTRIES).join("\n") + more;
    }
    return `Error: unknown tool ${name}.`;
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

// src/agent.ts
var ToolArgs = type("Record<string, unknown>");
async function runAgent(opts) {
  const { llm, submit } = opts;
  const name = submit.spec.function.name;
  const tools = [...TOOL_SPECS, submit.spec];
  const messages = [
    { role: "system", content: opts.system },
    { role: "user", content: opts.user }
  ];
  let warned = false;
  for (let turn = 1; turn <= opts.maxTurns + 2; turn++) {
    if (!warned && (turn > opts.maxTurns || Date.now() > opts.deadline)) {
      warned = true;
      messages.push({
        role: "user",
        content: `You are out of time. Call ${name} now with what you have so far.`
      });
    }
    const reply = await llm.chat(messages, warned ? [submit.spec] : tools, warned ? name : void 0, opts.deadline);
    messages.push(reply);
    const calls = reply.tool_calls ?? [];
    if (!calls.length) {
      messages.push({ role: "user", content: `Use the tools, and finish by calling ${name}.` });
      continue;
    }
    for (const call of calls) {
      let args2;
      try {
        args2 = JSON.parse(call.function.arguments || "{}");
      } catch {
        messages.push({ role: "tool", tool_call_id: call.id, content: "Error: arguments are not valid JSON." });
        continue;
      }
      if (call.function.name === name) {
        const parsed2 = submit.parse(args2, warned);
        if (!parsed2.ok) {
          opts.log(`${name} rejected: ${parsed2.error.slice(0, 200)}`);
          messages.push({ role: "tool", tool_call_id: call.id, content: `Error: ${parsed2.error}. Fix it and call ${name} again.` });
          continue;
        }
        opts.log(`${name} after ${turn} turns`);
        return parsed2.value;
      }
      const record = ToolArgs(args2 ?? {});
      if (record instanceof type.errors) {
        messages.push({ role: "tool", tool_call_id: call.id, content: "Error: arguments must be a JSON object." });
        continue;
      }
      opts.log(`  ${call.function.name} ${JSON.stringify(record).slice(0, 120)}`);
      messages.push({ role: "tool", tool_call_id: call.id, content: await runTool(opts.root, call.function.name, record) });
    }
  }
  throw new Error(`${name} was never called after ${opts.maxTurns + 2} turns`);
}

// src/review.ts
var Severity2 = type.enumerated(...SEVERITIES);
var Candidate = type({
  file: type("string > 0").describe("Repository-relative path"),
  line: type("number.integer > 0").describe("First line of the defect at the PR head"),
  "end_line?": type("number.integer > 0").describe("Last line, if it spans several"),
  severity: Severity2,
  title: type("string > 0").describe("A few words stating the defect"),
  body: type("string > 0").describe("What breaks, the trigger, and the result. 2-4 plain sentences."),
  evidence: type("string[] > 0").describe('Lines that prove it, each "path:line: code"'),
  "rule?": type("string").describe("Repository rule id, if the finding breaks one")
});
var Findings = type({
  checked_files: type("string[]").describe("Every changed file you checked"),
  findings: Candidate.array()
});
var Verdict = type({
  verdict: "'confirmed' | 'rejected'",
  reason: type("string > 0").describe("One or two sentences"),
  evidence: type("string[]").describe('Lines you checked, each "path:line: code"'),
  severity: Severity2,
  "title?": type("string").describe("Corrected title, if confirmed and the original is off"),
  "body?": type("string").describe("Corrected body, if confirmed and the original overstates or misdescribes it"),
  "line?": type("number.integer > 0").describe("Corrected first line at the PR head, if the cited one is wrong"),
  "end_line?": type("number.integer > 0").describe("Corrected last line, if the cited one is wrong")
});
function toolSpec(name, description, schema2) {
  const parameters = Object.fromEntries(Object.entries(schema2.toJsonSchema()).filter(([key]) => key !== "$schema"));
  return { type: "function", function: { name, description, parameters } };
}
function submitFindings(changed) {
  return {
    spec: toolSpec("submit_findings", "Submit the review. Call once, after checking every changed file.", Findings),
    parse(args2, final) {
      const out = Findings(args2);
      if (out instanceof type.errors) return { ok: false, error: out.summary };
      const checked = new Set(out.checked_files.map((f) => f.replace(/^\.\//, "")));
      const missed = changed.filter((f) => !checked.has(f));
      if (missed.length && !final) return { ok: false, error: `you have not checked: ${missed.join(", ")}` };
      return {
        ok: true,
        value: out.findings.map((c) => ({
          file: c.file.replace(/^\.\//, ""),
          line: c.line,
          endLine: Math.max(c.line, c.end_line ?? c.line),
          severity: c.severity,
          title: c.title.trim(),
          body: c.body.trim(),
          evidence: c.evidence,
          ...c.rule ? { rule: c.rule } : {}
        }))
      };
    }
  };
}
var submitVerdict = {
  spec: toolSpec("submit_verdict", "Submit the verdict on the finding.", Verdict),
  parse(args2) {
    const out = Verdict(args2);
    return out instanceof type.errors ? { ok: false, error: out.summary } : { ok: true, value: out };
  }
};
var FIND_SYSTEM = `You are ReviewPilot, a senior engineer reviewing a pull request. Find the defects this PR introduces.
You are the first of two passes. You find candidates; a separate verifier then checks each one in depth against the code and throws out anything it cannot prove. So your job is recall: a real bug you skip is lost for good, while a candidate the verifier rejects costs little. List every specific, concrete suspicion.

You get part of the diff (other parts go to other reviewers), and you can read any file at the PR head, search the repository and list directories. Use them briefly to understand the code: open a caller, type or helper when you need it to see whether something is a problem. You have a small tool budget, so do not try to prove everything; leave deep checking to the verifier. Drop a candidate only when the code you have seen clearly rules it out, such as a guard or early return that already handles the case.

Go through every changed file in your part. Look for:
- logic bugs: wrong conditions, off-by-one, inverted checks, wrong variable, stale state, broken async ordering
- unhandled cases: null or empty input, error paths, retries, races, partial failure
- security and privacy: injection, XSS, SSRF, path traversal, missing auth or ownership checks, secrets in code or logs, one user's data reaching another, trusting client input
- data: schema or stored-data changes without a migration or backfill, data loss, breaking existing records or older clients
- what the change misses: a caller, type, config or code path that the new behaviour should have updated but did not
- inconsistency with how the same thing is done elsewhere in this repository
- the repository rules, if any are given

Do not report: formatting, naming or style; "add tests" or "add logging" as generic advice; problems that existed before this PR in code it does not touch; behaviour that a test in the diff or a code comment says is intended. That last exemption never covers security or privacy: if the intended behaviour itself lets one user's data reach another user, skips an auth or ownership check, or exposes a secret, report it.

Severity:
- critical: security or privacy hole, data loss or corruption, crash or broken build on a main path
- major: wrong behaviour real users will hit
- minor: a real but narrow edge case, or an inconsistency that will cause bugs later

Finish by calling submit_findings once. List every changed file in your part that you checked. For each candidate give file and line (new-side numbers from the diff, or the file's own numbering for code you opened), a title of a few words, a body of 2-4 plain sentences (what breaks, the input or sequence that triggers it, the result, and what the verifier should check), and evidence: the lines involved, each as "path:line: code". Be specific: "X is null when Y, so Z throws" is a candidate; "this could have edge cases" is not. An empty list is right only when you found nothing specific.`;
var VERIFY_SYSTEM = `You verify one code review finding on a pull request. Assume it is wrong until the code proves it right. You can read any file at the PR head, search the repository and list directories.

Check, in order:
1. The cited lines exist at the PR head and say what the finding claims.
2. Trace the trigger: follow the input through the actual code to the wrong result. Open every function, type and caller on the way. Do not assume what any of them do.
3. Look for anything that already prevents it: a guard, early return, validation, type constraint, a caller that never passes that input, or a test or comment in the PR showing the behaviour is intended. Intent does not clear a security or privacy problem: if the intended behaviour lets one user's data reach another user, skips an auth or ownership check, or exposes a secret, it still counts.
4. The PR introduced it: the lines are added or changed in the diff, or the diff changed something they depend on.

Claims about external tools, package versions, APIs or platform behaviour are only provable when the repository itself shows the problem (a lockfile, a test, docs or code in the repo). Your memory of a tool's current version or config keys can be out of date: reject such a claim if the repository cannot confirm it.

Confirm only if every step holds. Reject if any step fails or you cannot finish the check. Confirming a false finding costs more than rejecting a real one.

Exception: for a finding reported on an earlier commit, the only question is whether the problem is still in the code. A rejection marks it fixed, so reject only when you can show the current code no longer has it; if you cannot finish the check, confirm it.

Call submit_verdict with the verdict, a one or two sentence reason, the evidence lines you checked ("path:line: code"), and the severity you would give it. When confirming, also give a corrected title and body if the original overstates or misdescribes the problem.`;
function repoSection(config, rules, guidance) {
  const parts = [];
  if (rules.length) {
    parts.push(
      "Repository rules (cite the id in `rule` when a finding breaks one):\n" + rules.map((r) => `- ${r.id} [${r.severity ?? "major"}]: ${r.rule}`).join("\n")
    );
  }
  if (config.instructions.trim()) parts.push(`Repository instructions:
${config.instructions.trim()}`);
  if (guidance.trim()) parts.push(`Repository guidance (from its agent docs, default branch):
${guidance.trim()}`);
  return parts.length ? `

${parts.join("\n\n")}` : "";
}
var pool = async (items, size, fn2) => {
  const results = new Array(items.length);
  const queue = items.entries();
  const worker = async () => {
    for (const [i, item] of queue) results[i] = await fn2(item, i);
  };
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return results;
};
function chunk(diffs, size) {
  const parts = [];
  let current = [];
  let length = 0;
  for (const d of diffs) {
    if (current.length && length + d.numbered.length > size) {
      parts.push(current);
      current = [];
      length = 0;
    }
    current.push(d);
    length += d.numbered.length;
  }
  if (current.length) parts.push(current);
  return parts;
}
var CHUNK_CHARS = 25e3;
var MAX_VERIFY = 25;
async function review(input2) {
  const { config, diffs, previous, log: log2 } = input2;
  const changed = diffs.filter((d) => d.status !== "deleted").map((d) => d.path);
  const open = previous.filter((p) => p.status === "open");
  const dismissed = previous.filter((p) => p.status === "dismissed");
  const history = [
    open.length && "Already reported and still being tracked (do not report again, in any wording):\n" + open.map((p) => `- ${p.file}:${p.line} ${p.title}`).join("\n"),
    dismissed.length && "Dismissed by the author (do not raise again):\n" + dismissed.map((p) => `- ${p.file}:${p.line} ${p.title}`).join("\n")
  ].filter(Boolean);
  const all = diffs.map((d) => `- ${d.path} (${d.status})`).join("\n");
  const chunks = chunk(diffs, CHUNK_CHARS);
  log2(`find: ${changed.length} files in ${chunks.length} parts`);
  const parts = await pool(chunks, 3, async (part, i) => {
    const mine = part.filter((d) => d.status !== "deleted").map((d) => d.path);
    const user = [
      `PR title: ${input2.pr.title}`,
      `PR description:
${input2.pr.body.slice(0, 4e3) || "(none)"}`,
      ...history,
      `All files changed in the PR:
${all}`,
      `Your part (${i + 1} of ${chunks.length}). Diff, left column is the line number at the PR head; + added, - removed:

${part.map((d) => `## ${d.path} (${d.status})
${d.numbered}`).join("\n\n")}`
    ].join("\n\n");
    return runAgent({
      llm: input2.find,
      root: input2.root,
      system: FIND_SYSTEM + repoSection(config, input2.rules, input2.guidance),
      user,
      submit: submitFindings(mine),
      maxTurns: 12,
      deadline: Date.now() + 4 * 6e4,
      log: (line) => log2(`[part ${i + 1}] ${line}`)
    }).catch((e) => {
      log2(`[part ${i + 1}] find failed: ${e instanceof Error ? e.message : String(e)}`);
      return void 0;
    });
  });
  const failedParts = parts.filter((p) => p === void 0).length;
  const ruleIds = new Set(input2.rules.map((r) => r.id));
  const candidates = parts.flatMap((p) => p ?? []);
  const exists = await Promise.all(candidates.map((c) => inside(input2.root, c.file).then(Boolean)));
  const found = candidates.filter((_, i) => exists[i]).map(({ rule, ...c }) => rule && ruleIds.has(rule) ? { ...c, rule } : c).sort(bySeverity);
  if (found.length < candidates.length) log2(`find: dropped ${candidates.length - found.length} candidates citing files not in the repo`);
  log2(`find: ${found.length} candidates${found.length > MAX_VERIFY ? `, verifying the ${MAX_VERIFY} most severe` : ""}`);
  const jobs = [
    ...found.slice(0, MAX_VERIFY).map((finding) => ({ finding })),
    // An earlier finding is re-checked only when its file is in the reviewed diff. Without
    // the diff the verifier cannot tell, and a rejection would wrongly mark it fixed.
    ...open.filter((p) => diffs.some((d) => d.path === p.file)).map((p) => ({ finding: p, previous: p }))
  ];
  const patchOf = (file) => diffs.find((d) => d.path === file)?.numbered ?? "(file not in the diff)";
  const checked = await pool(jobs, 4, async ({ finding, previous: prev }) => {
    const verdict = await runAgent({
      llm: input2.verify,
      root: input2.root,
      system: VERIFY_SYSTEM,
      user: [
        prev ? "This finding was reported on an earlier commit. Check whether it is still present at the current PR head (see the exception for earlier findings)." : "",
        `Finding:
${JSON.stringify(
          { file: finding.file, line: finding.line, end_line: finding.endLine, severity: finding.severity, title: finding.title, body: finding.body, evidence: finding.evidence },
          null,
          2
        )}`,
        `Diff of ${finding.file}:
${patchOf(finding.file)}`
      ].filter(Boolean).join("\n\n"),
      submit: submitVerdict,
      maxTurns: 12,
      deadline: Date.now() + 3 * 6e4,
      log: () => {
      }
    }).catch((e) => {
      log2(`verify error: ${finding.file}:${finding.line} ${e instanceof Error ? e.message : String(e)}`);
      return void 0;
    });
    if (verdict) log2(`verify ${verdict.verdict}: ${finding.file}:${finding.line} ${finding.title} (${verdict.reason.slice(0, 160)})`);
    return { finding, ...verdict ? { verdict } : {}, ...prev ? { previous: prev } : {} };
  });
  return { checked, candidates: found.length, verified: jobs.length, failedParts, parts: chunks.length };
}
var Groups = type({ duplicates: "string[][]" });
async function dedupe(llm, root, findings, known, log2) {
  if (!findings.length || findings.length + known.length < 2) return [...findings];
  const list = [...known, ...findings];
  const groups = await runAgent({
    llm,
    root,
    system: "You group code review findings that describe the same underlying defect (same root cause, even if worded differently or cited at different lines). Findings that only share a file or a topic are not duplicates. Answer with submit_groups right away; you do not need the other tools.",
    user: list.map((f, i) => `[f${i}] ${f.file}:${f.line} [${f.severity}] ${f.title}
   ${f.body}`).join("\n"),
    submit: {
      spec: {
        type: "function",
        function: {
          name: "submit_groups",
          description: "Submit groups of duplicate finding numbers. Omit findings that have no duplicate.",
          parameters: {
            type: "object",
            properties: {
              duplicates: { type: "array", items: { type: "array", items: { type: "string" } }, description: 'Groups of ids exactly as listed, e.g. [["f0", "f3"]]' }
            },
            required: ["duplicates"]
          }
        }
      },
      parse(args2) {
        const out = Groups(args2);
        return out instanceof type.errors ? { ok: false, error: out.summary } : { ok: true, value: out.duplicates };
      }
    },
    maxTurns: 2,
    deadline: Date.now() + 6e4,
    log: () => {
    }
  }).catch(() => []);
  const drop = /* @__PURE__ */ new Set();
  for (const group of groups) {
    const ids = group.map((id) => Number(/^f(\d+)$/.exec(id.trim())?.[1] ?? NaN));
    const [, ...rest] = [...new Set(ids)].filter((i) => Number.isInteger(i) && i >= 0 && i < list.length).sort((a, b) => a - b);
    for (const i of rest) drop.add(i);
  }
  const kept = findings.filter((_, i) => !drop.has(i + known.length));
  if (kept.length < findings.length) log2(`dedupe: dropped ${findings.length - kept.length} duplicate finding(s)`);
  return kept;
}
var settle = (finding, verdict) => ({
  ...finding,
  line: verdict.line ?? finding.line,
  endLine: Math.max(verdict.line ?? finding.line, verdict.end_line ?? (verdict.line ? verdict.line : finding.endLine)),
  severity: verdict.severity,
  title: verdict.title?.trim() || finding.title,
  body: verdict.body?.trim() || finding.body,
  evidence: verdict.evidence.length ? verdict.evidence : finding.evidence
});

// src/index.ts
var MAX_DIFF_CHARS = 4e5;
var GUIDANCE_CHARS = 1e4;
var MAINTAINERS = /* @__PURE__ */ new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
var input = (name) => process.env[`INPUT_${name.toUpperCase()}`]?.trim() || void 0;
var log = createLog(process.env.GITHUB_ACTIONS === "true");
var Event = type({
  "pull_request?": { number: "number" },
  "issue?": { number: "number", "pull_request?": "unknown" },
  "comment?": { id: "number", body: "string", author_association: "string", user: { login: "string" } }
});
async function main() {
  const started = Date.now();
  const repo = process.env.GITHUB_REPOSITORY ?? "";
  const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
  const dryRun = process.env.REVIEWPILOT_DRY_RUN === "1";
  const token = input("github_token") ?? process.env.GITHUB_TOKEN ?? "";
  const apiKey = input("api_key") ?? process.env.REVIEWPILOT_API_KEY ?? "";
  if (!repo || !token || !apiKey) throw new Error("Needs GITHUB_REPOSITORY, a GitHub token and api_key.");
  const botLogin = input("bot_login") ?? "github-actions[bot]";
  const ours = (login) => login === botLogin || login === "github-actions[bot]";
  const event = Event.assert(process.env.GITHUB_EVENT_PATH ? JSON.parse(await readFile2(process.env.GITHUB_EVENT_PATH, "utf8")) : {});
  const comment = event.comment;
  if (comment) {
    if (!/^\/review\b/.test(comment.body.trim())) return log.line("Comment is not /review, nothing to do.");
    if (!event.issue?.pull_request) return log.line("Comment is not on a pull request, nothing to do.");
    if (!MAINTAINERS.has(comment.author_association)) {
      return log.line(`/review from ${comment.user.login} (${comment.author_association}) ignored: only owners, members and collaborators can run it.`);
    }
  }
  const number2 = Number(process.env.REVIEWPILOT_PR) || event.pull_request?.number || event.issue?.number;
  if (!number2) return log.line("No pull request in this event.");
  const gh = createGitHub(token, repo);
  const pr = await gh.pr(number2);
  if (pr.state !== "open" && !process.env.REVIEWPILOT_PR) return log.line(`PR #${number2} is ${pr.state}, skipping.`);
  if (!comment && pr.draft) return log.line(`PR #${number2} is a draft, skipping.`);
  if (comment && !dryRun) await gh.react(comment.id, "eyes").catch(() => void 0);
  log.line(`Reviewing ${repo}#${number2} at ${pr.head.sha.slice(0, 7)} as ${botLogin}`);
  const summaries = (await gh.issueComments(number2)).filter((c) => c.body.includes(SUMMARY_TAG) && ours(c.user?.login));
  const existing = summaries.findLast((c) => c.user?.login === botLogin) ?? summaries.at(-1);
  const prev = existing ? readState(existing.body) : void 0;
  let summaryId = existing?.user?.login === botLogin ? existing.id : void 0;
  if (!dryRun) {
    const body = progressBody(pr.head.sha, prev ? writeState(prev) : void 0);
    const edited = summaryId ? await gh.editComment(summaryId, body).catch(() => void 0) : void 0;
    summaryId = edited?.id ?? (await gh.comment(number2, body)).id;
  }
  try {
    const { config, warning, mergeBase, defaultRef } = await log.phase("Checkout", async () => {
      const mergeBase2 = await checkoutPr(root, number2, pr.head.sha, pr.base.sha);
      const defaultRef2 = await fetchRef(root, pr.base.repo.default_branch);
      return { mergeBase: mergeBase2, defaultRef: defaultRef2, ...loadConfig(await readAt(root, defaultRef2, ".reviewpilot.yml")) };
    });
    if (warning) log.warn(warning);
    const model = input("model") ?? config.model.name;
    const verifyModel = input("verify_model") ?? config.model.verify;
    const baseUrl = input("base_url") ?? process.env.REVIEWPILOT_BASE_URL ?? "https://api.commandcode.ai/provider/v1";
    const { diffs, skipped, guidance, threads } = await log.phase("Diff and context", async () => {
      const reviewable = parseDiff(await diff(root, mergeBase, pr.head.sha, config.review.ignore)).filter(
        (d) => !ignored(config, d.path) && d.commentable.size > 0
      );
      let size = 0;
      const diffs2 = reviewable.filter((d) => {
        if (size + d.numbered.length > MAX_DIFF_CHARS) return false;
        size += d.numbered.length;
        return true;
      });
      const [guidance2, threads2] = await Promise.all([
        Promise.all(config.context_files.map(async (f) => {
          const text = await readAt(root, defaultRef, f);
          return text ? `--- ${f} ---
${text}` : "";
        })).then((parts2) => parts2.join("\n").slice(0, GUIDANCE_CHARS)),
        gh.threads(number2).catch((e) => {
          log.warn(`Could not read review threads, so dismissals and closing are skipped this run: ${String(e)}`);
          return [];
        })
      ]);
      log.line(`${diffs2.length} files, ${size.toLocaleString("en")} characters of diff, ${threads2.length} review threads`);
      return { diffs: diffs2, skipped: reviewable.length - diffs2.length, guidance: guidance2, threads: threads2 };
    });
    const threadOf = (f) => threads.find(
      (t) => f.commentId !== void 0 ? t.comments[0]?.databaseId === f.commentId : ours(t.comments[0]?.author) && lastMarker(t.comments[0]?.body ?? "", FINDING_TAG) === f.fp
    );
    const minRank = SEVERITIES.indexOf(config.review.min_severity);
    const previous = (prev?.findings ?? []).map((f) => ({ ...f }));
    for (const p of previous.filter((f) => f.status === "open")) {
      const t = threadOf(p);
      const replied = t?.comments.slice(1).some((c) => c.author === pr.user.login || MAINTAINERS.has(c.association));
      const resolved = t?.resolved && !ours(t.resolvedBy);
      if (resolved || replied || SEVERITIES.indexOf(p.severity) > minRank) p.status = "dismissed";
    }
    const llm = (m) => createLlm({ baseUrl, apiKey, model: m, effort: config.model.effort });
    const find = llm(model);
    const verify = verifyModel === model ? find : llm(verifyModel);
    const { checked, candidates, verified, failedParts, parts } = await log.phase(
      "Review",
      () => review({
        find,
        verify,
        root,
        config,
        rules: rulesFor(config, diffs.map((d) => d.path)),
        guidance,
        pr: { title: pr.title, body: pr.body ?? "" },
        diffs,
        previous,
        log: log.line
      })
    );
    const { findings, fresh, overCap } = await log.phase("Merge", async () => {
      const findings2 = previous.map((p) => {
        if (p.status !== "open") return p;
        const c = checked.find((x) => x.previous === p);
        if (!c?.verdict) return p;
        if (c.verdict.verdict !== "confirmed") return { ...p, status: "fixed" };
        const { line, endLine, severity } = settle(p, c.verdict);
        return { ...p, line, endLine, severity };
      });
      const confirmed = checked.flatMap((c) => !c.previous && c.verdict?.verdict === "confirmed" ? [settle(c.finding, c.verdict)] : []).filter((f) => SEVERITIES.indexOf(f.severity) <= minRank).sort(bySeverity);
      const known = findings2.filter((t) => t.status !== "fixed");
      const fresh2 = [];
      let overCap2 = 0;
      for (const f of await dedupe(find, root, confirmed, known, log.line)) {
        const base = fingerprint(f);
        const clash = [...findings2, ...fresh2].find((t) => t.fp === base && t.status !== "fixed" && Math.abs(t.line - f.line) > 20);
        const fp = clash ? fingerprint({ file: f.file, title: `${f.title}@${f.line}` }) : base;
        if ([...known, ...fresh2].some((t) => t.fp === fp || sameIssue(t, f))) continue;
        if (fresh2.length >= config.review.max_findings) {
          overCap2 += 1;
          continue;
        }
        const reopened = findings2.findIndex((t) => t.fp === fp && t.status === "fixed");
        if (reopened >= 0) findings2.splice(reopened, 1);
        fresh2.push({ ...f, fp, status: "open" });
      }
      findings2.push(...fresh2);
      return { findings: findings2, fresh: fresh2, overCap: overCap2 };
    });
    const open = findings.filter((f) => f.status === "open");
    const state = { head: pr.head.sha, score: score(open), findings };
    const byPath = new Map(diffs.map((d) => [d.path, d]));
    const inline = [];
    const outside = [];
    for (const f of fresh) {
      const at = anchor(byPath.get(f.file), f.line, f.endLine);
      if (at) inline.push({ path: f.file, line: at.line, ...at.startLine ? { start_line: at.startLine } : {}, body: inlineBody(f) });
      else outside.push(f);
    }
    const wasOpen = new Set(prev?.findings.filter((p) => p.status === "open").map((p) => p.fp));
    const fixedNow = findings.filter((f) => f.status === "fixed" && wasOpen.has(f.fp));
    const warningText = [
      warning,
      skipped > 0 ? `${skipped} files did not fit in the review budget and were not reviewed.` : "",
      overCap > 0 ? `${overCap} more confirmed findings were over max_findings (${config.review.max_findings}) and are not shown.` : "",
      failedParts > 0 ? `${failedParts} of ${parts} parts of the diff could not be reviewed this run, so this review is partial. Comment \`/review\` to retry.` : ""
    ].filter(Boolean).join(" ");
    const modelLabel = verifyModel === model ? model : `${model} (verify: ${verifyModel})`;
    const run2 = {
      repo,
      head: pr.head.sha,
      model: modelLabel,
      files: diffs.length,
      candidates,
      verified,
      seconds: Math.round((Date.now() - started) / 1e3),
      ...warningText ? { warning: warningText } : {}
    };
    const usage = verify === find ? find.usage : { calls: find.usage.calls + verify.usage.calls, prompt: find.usage.prompt + verify.usage.prompt, completion: find.usage.completion + verify.usage.completion };
    log.line(`Score ${state.score}/5: ${fresh.length} new, ${open.length} open, ${fixedNow.length} fixed. ${usage.calls} model calls, ${usage.prompt.toLocaleString("en")} in / ${usage.completion.toLocaleString("en")} out tokens.`);
    if (dryRun) {
      for (const c of inline) log.line(`
--- inline ${c.path}:${c.start_line ? `${c.start_line}-` : ""}${c.line}
${c.body}`);
      log.line(`
--- summary
${summaryBody(state, prev, outside, run2)}`);
      return;
    }
    await log.phase("Post", async () => {
      if (inline.length) {
        const posted = await gh.review(number2, pr.head.sha, inline).then(() => true, (e) => {
          log.warn(`Inline review failed, findings go to the summary instead: ${String(e)}`);
          return false;
        });
        if (posted) {
          const comments = await gh.reviewComments(number2).catch(() => []);
          for (const f of fresh) {
            const id = comments.findLast((c) => !c.in_reply_to_id && ours(c.user?.login) && lastMarker(c.body, FINDING_TAG) === f.fp)?.id;
            if (id !== void 0) f.commentId = id;
          }
        } else {
          outside.push(...fresh.filter((f) => !outside.includes(f)));
        }
      }
      const body = summaryBody(state, prev, outside, run2);
      const saved = summaryId !== void 0 && await gh.editComment(summaryId, body).then(() => true, () => false);
      if (!saved) summaryId = (await gh.comment(number2, body)).id;
      for (const old of summaries) {
        if (old.id !== summaryId) await gh.retire(old).catch((e) => log.warn(`Could not retire summary ${old.id}: ${String(e)}`));
      }
      let unresolved = 0;
      await pool(fixedNow, 2, async (f) => {
        if (f.commentId !== void 0) {
          await gh.reply(number2, f.commentId, `Fixed in ${pr.head.sha.slice(0, 7)}.`).catch((e) => log.warn(`Reply on ${f.fp} failed: ${String(e)}`));
        }
        const t = threadOf(f);
        if (!t || t.resolved) return;
        const resolved = await gh.close(t).catch((e) => {
          log.warn(`Closing ${f.fp} failed: ${String(e)}`);
          return true;
        });
        if (!resolved) unresolved += 1;
      });
      if (unresolved) log.line(`${unresolved} fixed threads collapsed but left unresolved: resolving needs Contents write on the token.`);
    });
    await log.report({
      score: state.score,
      findings: { new: fresh.length, open: open.length, fixed: fixedNow.length },
      candidates,
      verified,
      usage,
      model: modelLabel
    });
  } catch (e) {
    if (!dryRun && summaryId !== void 0) {
      const runUrl = `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID ?? ""}`;
      const restore = existing?.id === summaryId ? existing.body : void 0;
      const body = restore ?? `## ReviewPilot: review failed for ${pr.head.sha.slice(0, 7)}

See the [workflow run](${runUrl}). Comment \`/review\` to retry.
${SUMMARY_TAG}${prev ? `
${writeState(prev)}` : ""}`;
      await gh.editComment(summaryId, body).catch(() => void 0);
    }
    throw e;
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.stack ?? e.message : String(e));
  process.exitCode = 1;
});
