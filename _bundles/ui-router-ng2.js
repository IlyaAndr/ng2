/**
 * State-based routing for Angular 2
 * @version v1.0.0-beta.5
 * @link https://ui-router.github.io/ng2
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('ui-router-core'), require('@angular/common'), require('rxjs/ReplaySubject'), require('rxjs/BehaviorSubject'), require('rxjs/observable/of'), require('rxjs/observable/fromPromise'), require('rxjs/observable/combineLatest'), require('rxjs/operator/switchMap'), require('rxjs/operator/mergeMap'), require('rxjs/operator/map'), require('rxjs/operator/concat'), require('rxjs/Observable'), require('rxjs/operator/concatAll'), require('rxjs/operator/every'), require('rxjs/operator/last'), require('rxjs/operator/mergeAll'), require('ui-router-rx')) :
	typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'ui-router-core', '@angular/common', 'rxjs/ReplaySubject', 'rxjs/BehaviorSubject', 'rxjs/observable/of', 'rxjs/observable/fromPromise', 'rxjs/observable/combineLatest', 'rxjs/operator/switchMap', 'rxjs/operator/mergeMap', 'rxjs/operator/map', 'rxjs/operator/concat', 'rxjs/Observable', 'rxjs/operator/concatAll', 'rxjs/operator/every', 'rxjs/operator/last', 'rxjs/operator/mergeAll', 'ui-router-rx'], factory) :
	(factory((global['ui-router-ng2'] = global['ui-router-ng2'] || {}),global.ng.core,global['ui-router-core'],global.ng.common,global.Rx,global.Rx,global.Rx.Observable,global.Rx.Observable,global.rxjs_observable_combineLatest,global.rxjs_operator_switchMap,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.rxjs_operator_concat,global.Rx,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global.Rx.Observable.prototype,global['ui-router-rx']));
}(this, (function (exports,_angular_core,uiRouterCore,_angular_common,rxjs_ReplaySubject,rxjs_BehaviorSubject,rxjs_observable_of,rxjs_observable_fromPromise,rxjs_observable_combineLatest,rxjs_operator_switchMap,rxjs_operator_mergeMap,rxjs_operator_map,rxjs_operator_concat,rxjs_Observable,rxjs_operator_concatAll,rxjs_operator_every,l,rxjs_operator_mergeAll,uiRouterRx) { 'use strict';

/** @ng2api @module state */
/** */

/** @module decorators */
/** */
/**
 * An ES7 decorator which maps resolve data to a component.
 *
 * Add this decorator to a property of your component.
 * The decorator marks the component's property to receive resolve data.
 *
 * When resolve data of the same name (token) is found,
 * the resolve data will be assigned to the component's property.
 *
 * #### Example:
 *
 * The component's properties receive resolve data from the state definition.
 * ```js
 * @Component({ selector: 'foo' })
 * export class FooComponent {
 *   @Resolve() resolveToken1;
 *   @Resolve('resolveToken2') prop2;
 *   @Input() @Resolve() resolveToken3;
 * }
 *
 * const fooState = {
 *   name: 'foo',
 *   component: FooComponent,
 *   resolve: [
 *     { token: 'resolveToken1', deps: [], resolveFn: resolve1Fn },
 *     { token: 'resolveToken2', deps: [], resolveFn: resolve2Fn },
 *     { token: 'resolveToken3', deps: [], resolveFn: resolve3Fn },
 *   ]
 * }
 * ```
 *
 * @param token The resolve token to bind to this property
 *        (if omitted, the property name is used as the token)
 */
function ResolveData(token) {
    return function (target, property) {
        var inputs = target['__inputs'] = target['__inputs'] || {};
        token = token || property;
        inputs[token] = property;
    };
}

/** @module ng2 */
/**
 * @Kamshak It's imported like this in @angular/compiler as well.
 * Was going to mark it injectable as in
 * https://github.com/angular/angular/blob/42a287fabf6b035d51e00cf3006c27fec00f054a/modules/%40angular/compiler/src/ng_module_resolver.ts
 * but unfortunately not all platforms (namely browser-dynamic) provide it.
 */
var reflector = _angular_core.__core_private__.reflector;

/**
 * This is a [[StateBuilder.builder]] function for Angular `views`.
 *
 * When the [[StateBuilder]] builds a [[State]] object from a raw [[StateDeclaration]], this builder
 * handles the `views` property with logic specific to ui-router-ng2.
 *
 * If no `views: {}` property exists on the [[StateDeclaration]], then it creates the `views` object and
 * applies the state-level configuration to a view named `$default`.
 */
function ng2ViewsBuilder(state) {
    var views = {}, viewsObject = state.views || { "$default": uiRouterCore.pick(state, ["component", "bindings"]) };
    uiRouterCore.forEach(viewsObject, function (config, name) {
        name = name || "$default"; // Account for views: { "": { template... } }
        if (Object.keys(config).length == 0)
            return;
        config.$type = "ng2";
        config.$context = state;
        config.$name = name;
        var normalized = uiRouterCore.ViewService.normalizeUIViewTarget(config.$context, config.$name);
        config.$uiViewName = normalized.uiViewName;
        config.$uiViewContextAnchor = normalized.uiViewContextAnchor;
        views[name] = config;
    });
    return views;
}
var id$1 = 0;
var Ng2ViewConfig = (function () {
    function Ng2ViewConfig(path, viewDecl) {
        this.path = path;
        this.viewDecl = viewDecl;
        this.$id = id$1++;
        this.loaded = true;
    }
    Ng2ViewConfig.prototype.load = function () {
        return uiRouterCore.services.$q.when(this);
    };
    return Ng2ViewConfig;
}());

/**
 * Merge two injectors
 *
 * This class implements the Injector ng2 interface but delegates
 * to the Injectors provided in the constructor.
 */
var MergeInjector = (function () {
    function MergeInjector() {
        var injectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            injectors[_i - 0] = arguments[_i];
        }
        if (injectors.length < 2)
            throw new Error("pass at least two injectors");
        this.injectors = injectors;
    }
    /**
     * Get the token from the first injector which contains it.
     *
     * Delegates to the first Injector.get().
     * If not found, then delegates to the second Injector (and so forth).
     * If no Injector contains the token, return the `notFoundValue`, or throw.
     *
     * @param token the DI token
     * @param notFoundValue the value to return if none of the Injectors contains the token.
     * @returns {any} the DI value
     */
    MergeInjector.prototype.get = function (token, notFoundValue) {
        for (var i = 0; i < this.injectors.length; i++) {
            var val = this.injectors[i].get(token, MergeInjector.NOT_FOUND);
            if (val !== MergeInjector.NOT_FOUND)
                return val;
        }
        if (arguments.length >= 2)
            return notFoundValue;
        // This will throw the DI Injector error
        this.injectors[0].get(token);
    };
    MergeInjector.NOT_FOUND = {};
    return MergeInjector;
}());

/** @hidden */
var id = 0;
/**
 * Given a component class, gets the inputs of styles:
 *
 * - @Input('foo') _foo
 * - `inputs: ['foo']`
 *
 * @internalapi
 */
var ng2ComponentInputs = function (ng2CompClass, component) {
    /** Get "@Input('foo') _foo" inputs */
    var props = reflector.propMetadata(ng2CompClass);
    var _props = Object.keys(props || {})
        .map(function (key) { return ({ key: key, annoArr: props[key] }); })
        .reduce(function (acc, tuple) { return acc.concat(tuple.annoArr.map(function (anno) { return ({ key: tuple.key, anno: anno }); })); }, [])
        .filter(function (tuple) { return tuple.anno instanceof _angular_core.Input; })
        .map(function (tuple) { return ({ token: tuple.anno.bindingPropertyName || tuple.key, prop: tuple.key }); });
    /** Get "inputs: ['foo']" inputs */
    var inputs = reflector.annotations(ng2CompClass)
        .filter(function (x) { return x instanceof _angular_core.Component && !!x.inputs; })
        .map(function (x) { return x.inputs; })
        .reduce(uiRouterCore.flattenR, [])
        .map(function (input) { return ({ token: input, prop: input }); });
    /** Get @ResolveData('foo') _foo" inputs */
    var __inputs = component.__inputs || {};
    var resolves = Object.keys(__inputs)
        .map(function (key) { return ({ token: key, prop: __inputs[key] }); });
    return _props.concat(inputs).concat(resolves);
};
/**
 * A UI-Router viewport directive, which is filled in by a view (component) on a state.
 *
 * ### Selector
 *
 * A `ui-view` directive can be created as an element: `<ui-view></ui-view>` or as an attribute: `<div ui-view></div>`.
 *
 * ### Purpose
 *
 * This directive is used in a Component template (or as the root component) to create a viewport.  The viewport
 * is filled in by a view (as defined by a [[Ng2ViewDeclaration]] inside a [[Ng2StateDeclaration]]) when the view's
 * state has been activated.
 *
 * #### Example:
 * ```js
 * // This app has two states, 'foo' and 'bar'
 * stateRegistry.register({ name: 'foo', url: '/foo', component: FooComponent });
 * stateRegistry.register({ name: 'bar', url: '/bar', component: BarComponent });
 * ```
 * ```html
 * <!-- This ui-view will be filled in by the foo state's component or
 *      the bar state's component when the foo or bar state is activated -->
 * <ui-view></ui-view>
 * ```
 *
 * ### Named ui-views
 *
 * A `ui-view` may optionally be given a name via the attribute value: `<div ui-view='header'></div>`.  *Note:
 * an unnamed `ui-view` is internally named `$default`*.   When a `ui-view` has a name, it will be filled in
 * by a matching named view.
 *
 * #### Example:
 * ```js
 * stateRegistry.register({
 *   name: 'foo',
 *   url: '/foo',
 *   views: { header: HeaderComponent, $default: FooComponent });
 * ```
 * ```html
 * <!-- When 'foo' state is active, filled by HeaderComponent -->
 * <div ui-view="header"></div>
 *
 * <!-- When 'foo' state is active, filled by FooComponent -->
 * <ui-view></ui-view>
 * ```
 */
var UIView = (function () {
    function UIView(router, parent, viewContainerRef) {
        this.router = router;
        this.viewContainerRef = viewContainerRef;
        /** Data about the this UIView */
        this.uiViewData = {};
        this.parent = parent;
    }
    Object.defineProperty(UIView.prototype, "_name", {
        set: function (val) { this.name = val; },
        enumerable: true,
        configurable: true
    });
    UIView.prototype.ngOnInit = function () {
        var _this = this;
        var router = this.router;
        var parentFqn = this.parent.fqn;
        var name = this.name || '$default';
        this.uiViewData = {
            $type: 'ng2',
            id: id++,
            name: name,
            fqn: parentFqn ? parentFqn + "." + name : name,
            creationContext: this.parent.context,
            configUpdated: this.viewConfigUpdated.bind(this),
            config: undefined
        };
        this.deregisterHook = router.transitionService.onBefore({}, function (trans) { return _this.applyUiCanExitHook(trans); });
        this.deregisterUIView = router.viewService.registerUIView(this.uiViewData);
    };
    /**
     * For each transition, checks the component loaded in the ui-view for:
     *
     * - has a uiCanExit() component hook
     * - is being exited
     *
     * If both are true, adds the uiCanExit component function as a hook to that singular Transition.
     */
    UIView.prototype.applyUiCanExitHook = function (trans) {
        var instance = this.componentRef && this.componentRef.instance;
        var uiCanExitFn = instance && instance.uiCanExit;
        if (uiRouterCore.isFunction(uiCanExitFn)) {
            var state = uiRouterCore.parse("uiViewData.config.viewDecl.$context.self")(this);
            if (trans.exiting().indexOf(state) !== -1) {
                trans.onStart({}, function (trans) {
                    return uiCanExitFn.call(instance, trans);
                });
            }
        }
    };
    UIView.prototype.disposeLast = function () {
        if (this.componentRef)
            this.componentRef.destroy();
        this.componentRef = null;
    };
    UIView.prototype.ngOnDestroy = function () {
        if (this.deregisterUIView)
            this.deregisterUIView();
        if (this.deregisterHook)
            this.deregisterHook();
        this.disposeLast();
    };
    /**
     * The view service is informing us of an updated ViewConfig
     * (usually because a transition activated some state and its views)
     */
    UIView.prototype.viewConfigUpdated = function (config) {
        // The config may be undefined if there is nothing currently targeting this UIView.
        // Dispose the current component, if there is one
        if (!config)
            return this.disposeLast();
        // Only care about Ng2 configs
        if (!(config instanceof Ng2ViewConfig))
            return;
        // The "new" viewconfig is already applied, so exit early
        if (this.uiViewData.config === config)
            return;
        // This is a new ViewConfig.  Dispose the previous component
        this.disposeLast();
        uiRouterCore.trace.traceUIViewConfigUpdated(this.uiViewData, config && config.viewDecl.$context);
        this.applyUpdatedConfig(config);
    };
    UIView.prototype.applyUpdatedConfig = function (config) {
        this.uiViewData.config = config;
        // Create the Injector for the routed component
        var context = new uiRouterCore.ResolveContext(config.path);
        var componentInjector = this.getComponentInjector(context);
        // Get the component class from the view declaration. TODO: allow promises?
        var componentClass = config.viewDecl.component;
        // Create the component
        var compFactoryResolver = componentInjector.get(_angular_core.ComponentFactoryResolver);
        var compFactory = compFactoryResolver.resolveComponentFactory(componentClass);
        this.componentRef = this.componentTarget.createComponent(compFactory, undefined, componentInjector);
        // Wire resolves to @Input()s
        this.applyInputBindings(this.componentRef, context, componentClass);
    };
    /**
     * Creates a new Injector for a routed component.
     *
     * Adds resolve values to the Injector
     * Adds providers from the NgModule for the state
     * Adds providers from the parent Component in the component tree
     * Adds a PARENT_INJECT view context object
     *
     * @returns an Injector
     */
    UIView.prototype.getComponentInjector = function (context) {
        // Map resolves to "useValue: providers"
        var resolvables = context.getTokens().map(function (token) { return context.getResolvable(token); }).filter(function (r) { return r.resolved; });
        var newProviders = resolvables.map(function (r) { return ({ provide: r.token, useValue: r.data }); });
        var parentInject = { context: this.uiViewData.config.viewDecl.$context, fqn: this.uiViewData.fqn };
        newProviders.push({ provide: UIView.PARENT_INJECT, useValue: parentInject });
        var parentComponentInjector = this.viewContainerRef.injector;
        var moduleInjector = context.getResolvable(uiRouterCore.NATIVE_INJECTOR_TOKEN).data;
        var mergedParentInjector = new MergeInjector(moduleInjector, parentComponentInjector);
        return _angular_core.ReflectiveInjector.resolveAndCreate(newProviders, mergedParentInjector);
    };
    /**
     * Supplies component inputs with resolve data
     *
     * Finds component inputs which match resolves (by name) and sets the input value
     * to the resolve data.
     */
    UIView.prototype.applyInputBindings = function (ref, context, componentClass) {
        var component = ref.instance;
        var bindings = this.uiViewData.config.viewDecl['bindings'] || {};
        var explicitBoundProps = Object.keys(bindings);
        // Supply resolve data to matching @Input('prop') or inputs: ['prop']
        var explicitInputTuples = explicitBoundProps
            .reduce(function (acc, key) { return acc.concat([{ prop: key, token: bindings[key] }]); }, []);
        var implicitInputTuples = ng2ComponentInputs(componentClass, component)
            .filter(function (tuple) { return !uiRouterCore.inArray(explicitBoundProps, tuple.prop); });
        var addResolvable = function (tuple) { return ({
            prop: tuple.prop,
            resolvable: context.getResolvable(tuple.token),
        }); };
        explicitInputTuples.concat(implicitInputTuples)
            .map(addResolvable)
            .filter(function (tuple) { return tuple.resolvable && tuple.resolvable.resolved; })
            .forEach(function (tuple) { component[tuple.prop] = tuple.resolvable.data; });
        // Initiate change detection for the newly created component
        ref.changeDetectorRef.detectChanges();
    };
    UIView.PARENT_INJECT = "UIView.PARENT_INJECT";
    UIView.decorators = [
        { type: _angular_core.Component, args: [{
                    selector: 'ui-view, [ui-view]',
                    template: "\n    <template #componentTarget></template>\n    <ng-content *ngIf=\"!componentRef\"></ng-content>\n  "
                },] },
    ];
    /** @nocollapse */
    UIView.ctorParameters = function () { return [
        { type: uiRouterCore.UIRouter, },
        { type: undefined, decorators: [{ type: _angular_core.Inject, args: [UIView.PARENT_INJECT,] },] },
        { type: _angular_core.ViewContainerRef, },
    ]; };
    UIView.propDecorators = {
        'componentTarget': [{ type: _angular_core.ViewChild, args: ['componentTarget', { read: _angular_core.ViewContainerRef },] },],
        'name': [{ type: _angular_core.Input, args: ['name',] },],
        '_name': [{ type: _angular_core.Input, args: ['ui-view',] },],
    };
    return UIView;
}());

function applyModuleConfig(uiRouter, injector, module) {
    if (module === void 0) { module = {}; }
    if (uiRouterCore.isFunction(module.config)) {
        module.config(uiRouter, injector, module);
    }
    var states = module.states || [];
    return states.map(function (state) { return uiRouter.stateRegistry.register(state); });
}
function applyRootModuleConfig(uiRouter, injector, module) {
    uiRouterCore.isDefined(module.deferIntercept) && uiRouter.urlService.deferIntercept(module.deferIntercept);
    uiRouterCore.isDefined(module.otherwise) && uiRouter.urlService.rules.otherwise(module.otherwise);
}

/**
 * @internalapi
 * # blah blah blah
 */
var AnchorUISref = (function () {
    function AnchorUISref(_el, _renderer) {
        this._el = _el;
        this._renderer = _renderer;
    }
    AnchorUISref.prototype.update = function (href) {
        this._renderer.setElementProperty(this._el.nativeElement, 'href', href);
    };
    AnchorUISref.decorators = [
        { type: _angular_core.Directive, args: [{ selector: 'a[uiSref]' },] },
    ];
    /** @nocollapse */
    AnchorUISref.ctorParameters = function () { return [
        { type: _angular_core.ElementRef, },
        { type: _angular_core.Renderer, },
    ]; };
    return AnchorUISref;
}());
/**
 * A directive when clicked, initiates a [[Transition]] to a [[TargetState]].
 *
 * ### Purpose
 *
 * This directive is applied to anchor tags (`<a>`) or any other clickable element.  It is a state reference (or sref --
 * similar to an href).  When clicked, the directive will transition to that state by calling [[StateService.go]],
 * and optionally supply state parameter values and transition options.
 *
 * When this directive is on an anchor tag, it will also add an `href` attribute to the anchor.
 *
 * ### Selector
 *
 * - `[uiSref]`: The directive is created as an attribute on an element, e.g., `<a uiSref></a>`
 *
 * ### Inputs
 *
 * - `uiSref`: the target state's name, e.g., `uiSref="foostate"`.  If a component template uses a relative `uiSref`,
 * e.g., `uiSref=".child"`, the reference is relative to that component's state.
 *
 * - `uiParams`: any target state parameter values, as an object, e.g., `[uiParams]="{ fooId: bar.fooId }"`
 *
 * - `uiOptions`: [[TransitionOptions]], e.g., `[uiOptions]="{ inherit: false }"`
 *
 * @example
 * ```html
 *
 * <!-- Targets bar state' -->
 * <a uiSref="bar">Bar</a>
 *
 * <!-- Assume this component's state is "foo".
 *      Relatively targets "foo.child" -->
 * <a uiSref=".child">Foo Child</a>
 *
 * <!-- Targets "bar" state and supplies parameter value -->
 * <a uiSref="bar" [uiParams]="{ barId: foo.barId }">Bar {{foo.barId}}</a>
 *
 * <!-- Targets "bar" state and parameter, doesn't inherit existing parameters-->
 * <a uiSref="bar" [uiParams]="{ barId: foo.barId }" [uiOptions]="{ inherit: false }">Bar {{foo.barId}}</a>
 * ```
 */
var UISref = (function () {
    function UISref(_router, _anchorUISref, parent) {
        var _this = this;
        /**
         * An observable (ReplaySubject) of the state this UISref is targeting.
         * When the UISref is clicked, it will transition to this [[TargetState]].
         */
        this.targetState$ = new rxjs_ReplaySubject.ReplaySubject(1);
        /** @internalapi */ this._emit = false;
        this._router = _router;
        this._anchorUISref = _anchorUISref;
        this.parent = parent;
        this._statesSub = _router.globals.states$.subscribe(function () { return _this.update(); });
    }
    Object.defineProperty(UISref.prototype, "uiSref", {
        /** @internalapi */
        set: function (val) { this.state = val; this.update(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UISref.prototype, "uiParams", {
        /** @internalapi */
        set: function (val) { this.params = val; this.update(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UISref.prototype, "uiOptions", {
        /** @internalapi */
        set: function (val) { this.options = val; this.update(); },
        enumerable: true,
        configurable: true
    });
    UISref.prototype.ngOnInit = function () {
        this._emit = true;
        this.update();
    };
    UISref.prototype.ngOnDestroy = function () {
        this._emit = false;
        this._statesSub.unsubscribe();
        this.targetState$.unsubscribe();
    };
    UISref.prototype.update = function () {
        var $state = this._router.stateService;
        if (this._emit) {
            var newTarget = $state.target(this.state, this.params, this.getOptions());
            this.targetState$.next(newTarget);
        }
        if (this._anchorUISref) {
            var href = $state.href(this.state, this.params, this.getOptions());
            this._anchorUISref.update(href);
        }
    };
    UISref.prototype.getOptions = function () {
        var defaultOpts = {
            relative: this.parent && this.parent.context && this.parent.context.name,
            inherit: true,
            source: "sref"
        };
        return uiRouterCore.extend(defaultOpts, this.options || {});
    };
    /** When triggered by a (click) event, this function transitions to the UISref's target state */
    UISref.prototype.go = function () {
        this._router.stateService.go(this.state, this.params, this.getOptions());
        return false;
    };
    UISref.decorators = [
        { type: _angular_core.Directive, args: [{
                    selector: '[uiSref]',
                    host: { '(click)': 'go()' }
                },] },
    ];
    /** @nocollapse */
    UISref.ctorParameters = function () { return [
        { type: uiRouterCore.UIRouter, },
        { type: AnchorUISref, decorators: [{ type: _angular_core.Optional },] },
        { type: undefined, decorators: [{ type: _angular_core.Inject, args: [UIView.PARENT_INJECT,] },] },
    ]; };
    UISref.propDecorators = {
        'state': [{ type: _angular_core.Input, args: ['uiSref',] },],
        'params': [{ type: _angular_core.Input, args: ['uiParams',] },],
        'options': [{ type: _angular_core.Input, args: ['uiOptions',] },],
    };
    return UISref;
}());

/** @internalapi */
var inactiveStatus = {
    active: false,
    exact: false,
    entering: false,
    exiting: false
};
/**
 * Returns a Predicate<PathNode[]>
 *
 * The predicate returns true when the target state (and param values)
 * match the (tail of) the path, and the path's param values
 *
 * @internalapi
 */
var pathMatches = function (target) {
    if (!target.exists())
        return function () { return false; };
    var state = target.$state();
    var targetParamVals = target.params();
    var targetPath = uiRouterCore.PathFactory.buildPath(target);
    var paramSchema = targetPath.map(function (node) { return node.paramSchema; })
        .reduce(uiRouterCore.unnestR, [])
        .filter(function (param) { return targetParamVals.hasOwnProperty(param.id); });
    return function (path) {
        var tailNode = uiRouterCore.tail(path);
        if (!tailNode || tailNode.state !== state)
            return false;
        var paramValues = uiRouterCore.PathFactory.paramValues(path);
        return uiRouterCore.Param.equals(paramSchema, paramValues, targetParamVals);
    };
};
/**
 * Given basePath: [a, b], appendPath: [c, d]),
 * Expands the path to [c], [c, d]
 * Then appends each to [a,b,] and returns: [a, b, c], [a, b, c, d]
 *
 * @internalapi
 */
function spreadToSubPaths(basePath, appendPath) {
    return appendPath.map(function (node) { return basePath.concat(uiRouterCore.PathFactory.subPath(appendPath, function (n) { return n.state === node.state; })); });
}
/**
 * Given a TransEvt (Transition event: started, success, error)
 * and a UISref Target State, return a SrefStatus object
 * which represents the current status of that Sref:
 * active, activeEq (exact match), entering, exiting
 *
 * @internalapi
 */
function getSrefStatus(event, srefTarget) {
    var pathMatchesTarget = pathMatches(srefTarget);
    var tc = event.trans.treeChanges();
    var isStartEvent = event.evt === 'start';
    var isSuccessEvent = event.evt === 'success';
    var activePath = isSuccessEvent ? tc.to : tc.from;
    var isActive = function () {
        return spreadToSubPaths([], activePath)
            .map(pathMatchesTarget)
            .reduce(uiRouterCore.anyTrueR, false);
    };
    var isExact = function () {
        return pathMatchesTarget(activePath);
    };
    var isEntering = function () {
        return spreadToSubPaths(tc.retained, tc.entering)
            .map(pathMatchesTarget)
            .reduce(uiRouterCore.anyTrueR, false);
    };
    var isExiting = function () {
        return spreadToSubPaths(tc.retained, tc.exiting)
            .map(pathMatchesTarget)
            .reduce(uiRouterCore.anyTrueR, false);
    };
    return {
        active: isActive(),
        exact: isExact(),
        entering: isStartEvent ? isEntering() : false,
        exiting: isStartEvent ? isExiting() : false,
    };
}
/** @internalapi */
function mergeSrefStatus(left, right) {
    return {
        active: left.active || right.active,
        exact: left.exact || right.exact,
        entering: left.entering || right.entering,
        exiting: left.exiting || right.exiting,
    };
}
/**
 * A directive which emits events when a paired [[UISref]] status changes.
 *
 * This directive is primarily used by the [[UISrefActive]] directives to monitor `UISref`(s).
 *
 * This directive shares two attribute selectors with `UISrefActive`:
 *
 * - `[uiSrefActive]`
 * - `[uiSrefActiveEq]`.
 *
 * Thus, whenever a `UISrefActive` directive is created, a `UISrefStatus` directive is also created.
 *
 * Most apps should simply use `UISrefActive`, but some advanced components may want to process the
 * [[SrefStatus]] events directly.
 *
 * ```js
 * <li (uiSrefStatus)="onSrefStatusChanged($event)">
 *   <a uiSref="book" [uiParams]="{ bookId: book.id }">Book {{ book.name }}</a>
 * </li>
 * ```
 *
 * The `uiSrefStatus` event is emitted whenever an enclosed `uiSref`'s status changes.
 * The event emitted is of type [[SrefStatus]], and has boolean values for `active`, `exact`, `entering`, and `exiting`.
 *
 * The values from this event can be captured and stored on a component (then applied, e.g., using ngClass).
 *
 * ---
 *
 * A single `uiSrefStatus` can enclose multiple `uiSref`.
 * Each status boolean (`active`, `exact`, `entering`, `exiting`) will be true if *any of the enclosed `uiSref` status is true*.
 * In other words, all enclosed `uiSref` statuses  are merged to a single status using `||` (logical or).
 *
 * ```js
 * <li (uiSrefStatus)="onSrefStatus($event)" uiSref="admin">
 *   Home
 *   <ul>
 *     <li> <a uiSref="admin.users">Users</a> </li>
 *     <li> <a uiSref="admin.groups">Groups</a> </li>
 *   </ul>
 * </li>
 * ```
 *
 * In the above example, `$event.active === true` when either `admin.users` or `admin.groups` is active.
 *
 * ---
 *
 * This API is subject to change.
 */
var UISrefStatus = (function () {
    function UISrefStatus(_globals) {
        /** current statuses of the state/params the uiSref directive is linking to */
        this.uiSrefStatus = new _angular_core.EventEmitter(false);
        this._globals = _globals;
        this.status = Object.assign({}, inactiveStatus);
    }
    UISrefStatus.prototype.ngAfterContentInit = function () {
        var _this = this;
        // Map each transition start event to a stream of:
        // start -> (success|error)
        var transEvents$ = rxjs_operator_switchMap.switchMap.call(this._globals.start$, function (trans) {
            var event = function (evt) { return ({ evt: evt, trans: trans }); };
            var transStart$ = rxjs_observable_of.of(event("start"));
            var transResult = trans.promise.then(function () { return event("success"); }, function () { return event("error"); });
            var transFinish$ = rxjs_observable_fromPromise.fromPromise(transResult);
            return rxjs_operator_concat.concat.call(transStart$, transFinish$);
        });
        // Watch the @ContentChildren UISref[] components and get their target states
        // let srefs$: Observable<UISref[]> = of(this.srefs.toArray()).concat(this.srefs.changes);
        this._srefs$ = new rxjs_BehaviorSubject.BehaviorSubject(this.srefs.toArray());
        this._srefChangesSub = this.srefs.changes.subscribe(function (srefs) { return _this._srefs$.next(srefs); });
        var targetStates$ = rxjs_operator_switchMap.switchMap.call(this._srefs$, function (srefs) {
            return rxjs_observable_combineLatest.combineLatest(srefs.map(function (sref) { return sref.targetState$; }));
        });
        // Calculate the status of each UISref based on the transition event.
        // Reduce the statuses (if multiple) by or-ing each flag.
        this._subscription = rxjs_operator_mergeMap.mergeMap.call(transEvents$, function (evt) {
            return rxjs_operator_map.map.call(targetStates$, function (targets) {
                var statuses = targets.map(function (target) { return getSrefStatus(evt, target); });
                return statuses.reduce(mergeSrefStatus);
            });
        }).subscribe(this._setStatus.bind(this));
    };
    UISrefStatus.prototype.ngOnDestroy = function () {
        if (this._subscription)
            this._subscription.unsubscribe();
        if (this._srefChangesSub)
            this._srefChangesSub.unsubscribe();
        if (this._srefs$)
            this._srefs$.unsubscribe();
        this._subscription = this._srefChangesSub = this._srefs$ = undefined;
    };
    UISrefStatus.prototype._setStatus = function (status) {
        this.status = status;
        this.uiSrefStatus.emit(status);
    };
    UISrefStatus.decorators = [
        { type: _angular_core.Directive, args: [{ selector: '[uiSrefStatus],[uiSrefActive],[uiSrefActiveEq]' },] },
    ];
    /** @nocollapse */
    UISrefStatus.ctorParameters = function () { return [
        { type: uiRouterCore.UIRouterGlobals, },
    ]; };
    UISrefStatus.propDecorators = {
        'uiSrefStatus': [{ type: _angular_core.Output, args: ["uiSrefStatus",] },],
        'srefs': [{ type: _angular_core.ContentChildren, args: [UISref, { descendants: true },] },],
    };
    return UISrefStatus;
}());

/**
 * A directive that adds a CSS class when its associated `uiSref` link is active.
 *
 * ### Purpose
 *
 * This directive should be paired with one (or more) [[UISref]] directives.
 * It will apply a CSS class to its element when the state the `uiSref` targets is activated.
 *
 * This can be used to create navigation UI where the active link is highlighted.
 *
 * ### Selectors
 *
 * - `[uiSrefActive]`: When this selector is used, the class is added when the target state or any
 * child of the target state is active
 * - `[uiSrefActiveEq]`: When this selector is used, the class is added when the target state is
 * exactly active (the class is not added if a child of the target state is active).
 *
 * ### Inputs
 *
 * - `uiSrefActive`/`uiSrefActiveEq`: one or more CSS classes to add to the element, when the `uiSref` is active
 *
 * #### Example:
 * The anchor tag has the `active` class added when the `foo` state is active.
 * ```html
 * <a uiSref="foo" uiSrefActive="active">Foo</a>
 * ```
 *
 * ### Matching parameters
 *
 * If the `uiSref` includes parameters, the current state must be active, *and* the parameter values must match.
 *
 * #### Example:
 * The first anchor tag has the `active` class added when the `foo.bar` state is active and the `id` parameter
 * equals 25.
 * The second anchor tag has the `active` class added when the `foo.bar` state is active and the `id` parameter
 * equals 32.
 * ```html
 * <a uiSref="foo.bar" [uiParams]="{ id: 25 }" uiSrefActive="active">Bar #25</a>
 * <a uiSref="foo.bar" [uiParams]="{ id: 32 }" uiSrefActive="active">Bar #32</a>
 * ```
 *
 * #### Example:
 * A list of anchor tags are created for a list of `bar` objects.
 * An anchor tag will have the `active` class when `foo.bar` state is active and the `id` parameter matches
 * that object's `id`.
 * ```html
 * <li *ngFor="let bar of bars">
 *   <a uiSref="foo.bar" [uiParams]="{ id: bar.id }" uiSrefActive="active">Bar #{{ bar.id }}</a>
 * </li>
 * ```
 *
 * ### Multiple uiSrefs
 *
 * A single `uiSrefActive` can be used for multiple `uiSref` links.
 * This can be used to create (for example) a drop down navigation menu, where the menui is highlighted
 * if *any* of its inner links are active.
 *
 * The `uiSrefActive` should be placed on an ancestor element of the `uiSref` list.
 * If anyof the `uiSref` links are activated, the class will be added to the ancestor element.
 *
 * #### Example:
 * This is a dropdown nagivation menu for "Admin" states.
 * When any of `admin.users`, `admin.groups`, `admin.settings` are active, the `<li>` for the dropdown
 * has the `dropdown-child-active` class applied.
 * Additionally, the active anchor tag has the `active` class applied.
 * ```html
 * <ul class="dropdown-menu">
 *   <li uiSrefActive="dropdown-child-active" class="dropdown admin">
 *     Admin
 *     <ul>
 *       <li><a uiSref="admin.users" uiSrefActive="active">Users</a></li>
 *       <li><a uiSref="admin.groups" uiSrefActive="active">Groups</a></li>
 *       <li><a uiSref="admin.settings" uiSrefActive="active">Settings</a></li>
 *     </ul>
 *   </li>
 * </ul>
 * ```
 */
var UISrefActive = (function () {
    function UISrefActive(uiSrefStatus, rnd, host) {
        var _this = this;
        this._classes = [];
        this._classesEq = [];
        this._subscription = uiSrefStatus.uiSrefStatus.subscribe(function (next) {
            _this._classes.forEach(function (cls) { return rnd.setElementClass(host.nativeElement, cls, next.active); });
            _this._classesEq.forEach(function (cls) { return rnd.setElementClass(host.nativeElement, cls, next.exact); });
        });
    }
    Object.defineProperty(UISrefActive.prototype, "active", {
        set: function (val) { this._classes = val.split("\s+"); },
        enumerable: true,
        configurable: true
    });
    
    Object.defineProperty(UISrefActive.prototype, "activeEq", {
        set: function (val) { this._classesEq = val.split("\s+"); },
        enumerable: true,
        configurable: true
    });
    
    UISrefActive.prototype.ngOnDestroy = function () {
        this._subscription.unsubscribe();
    };
    UISrefActive.decorators = [
        { type: _angular_core.Directive, args: [{
                    selector: '[uiSrefActive],[uiSrefActiveEq]'
                },] },
    ];
    /** @nocollapse */
    UISrefActive.ctorParameters = function () { return [
        { type: UISrefStatus, },
        { type: _angular_core.Renderer, },
        { type: _angular_core.ElementRef, decorators: [{ type: _angular_core.Host },] },
    ]; };
    UISrefActive.propDecorators = {
        'active': [{ type: _angular_core.Input, args: ['uiSrefActive',] },],
        'activeEq': [{ type: _angular_core.Input, args: ['uiSrefActiveEq',] },],
    };
    return UISrefActive;
}());

/** @internalapi */
var _UIROUTER_DIRECTIVES = [UISref, AnchorUISref, UIView, UISrefActive, UISrefStatus];
/**
 * References to the UI-Router directive classes, for use within a @Component's `directives:` property
 * @deprecated use [[UIRouterModule]]
 * @internalapi
 */
var UIROUTER_DIRECTIVES = _UIROUTER_DIRECTIVES;

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var __extends = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * @whatItDoes Name of the primary outlet.
 *
 * @stable
 */

var NavigationCancelingError = (function (_super) {
    __extends(NavigationCancelingError, _super);
    /**
     * @param {?} message
     */
    function NavigationCancelingError(message) {
        _super.call(this, message);
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
    /**
     * @return {?}
     */
    NavigationCancelingError.prototype.toString = function () { return this.message; };
    return NavigationCancelingError;
}(Error));
/**
 * @param {?} segments
 * @param {?} segmentGroup
 * @param {?} route
 * @return {?}
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */

/**
 * @param {?} a
 * @param {?} b
 * @return {?}
 */

/**
 * @param {?} a
 * @return {?}
 */

/**
 * @param {?} a
 * @return {?}
 */

/**
 * @param {?} a
 * @return {?}
 */

/**
 * @param {?} bools
 * @return {?}
 */

/**
 * @param {?} m1
 * @param {?} m2
 * @return {?}
 */

/**
 * @param {?} map
 * @param {?} callback
 * @return {?}
 */

/**
 * @param {?} obj
 * @param {?} fn
 * @return {?}
 */

/**
 * @param {?} observables
 * @return {?}
 */

/**
 * @param {?} value
 * @return {?}
 */

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @experimental
 */
var ROUTES = new _angular_core.OpaqueToken('ROUTES');

/** @hidden */ var UIROUTER_ROOT_MODULE = new _angular_core.OpaqueToken("UIRouter Root Module");
/** @hidden */ var UIROUTER_MODULE_TOKEN = new _angular_core.OpaqueToken("UIRouter Module");
/** @hidden */ var UIROUTER_STATES = new _angular_core.OpaqueToken("UIRouter States");
// /** @hidden */ export const ROUTES = UIROUTER_STATES;
function makeRootProviders(module) {
    return [
        { provide: UIROUTER_ROOT_MODULE, useValue: module, multi: true },
        { provide: UIROUTER_MODULE_TOKEN, useValue: module, multi: true },
        { provide: ROUTES, useValue: module.states || [], multi: true },
        { provide: _angular_core.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: module.states || [], multi: true },
    ];
}
function makeChildProviders(module) {
    return [
        { provide: UIROUTER_MODULE_TOKEN, useValue: module, multi: true },
        { provide: ROUTES, useValue: module.states || [], multi: true },
        { provide: _angular_core.ANALYZE_FOR_ENTRY_COMPONENTS, useValue: module.states || [], multi: true },
    ];
}
function locationStrategy(useHash) {
    return { provide: _angular_common.LocationStrategy, useClass: useHash ? _angular_common.HashLocationStrategy : _angular_common.PathLocationStrategy };
}
/**
 * Creates UI-Router Modules
 *
 * This class has two static factory methods which create UIRouter Modules.
 * A UI-Router Module is an [Angular NgModule](https://angular.io/docs/ts/latest/guide/ngmodule.html)
 * with support for UI-Router.
 *
 * ### UIRouter Directives
 *
 * When a UI-Router Module is imported into a `NgModule`, that module's components
 * can use the UIRouter Directives such as [[UIView]], [[UISref]], [[UISrefActive]].
 *
 * ### State Definitions
 *
 * State definitions found in the `states:` property are provided to the Dependency Injector.
 * This enables UI-Router to automatically register the states with the [[StateRegistry]] at bootstrap (and during lazy load).
 *
 * ### Entry Components
 *
 * Any routed components are added as `entryComponents:` so they will get compiled.
 */
var UIRouterModule = (function () {
    function UIRouterModule() {
    }
    /**
     * Creates a UI-Router Module for the root (bootstrapped) application module to import
     *
     * This factory function creates an [Angular NgModule](https://angular.io/docs/ts/latest/guide/ngmodule.html)
     * with UI-Router support.
     *
     * The `forRoot` module should be added to the `imports:` of the `NgModule` being bootstrapped.
     * An application should only create and import a single `NgModule` using `forRoot()`.
     * All other modules should be created using [[UIRouterModule.forChild]].
     *
     * Unlike `forChild`, an `NgModule` returned by this factory provides the [[UIRouter]] singleton object.
     * This factory also accepts root-level router configuration.
     * These are the only differences between `forRoot` and `forChild`.
     *
     * Example:
     * ```js
     * let routerConfig = {
     *   otherwise: '/home',
     *   states: [homeState, aboutState]
     * };
     *
     * @ NgModule({
     *   imports: [
     *     BrowserModule,
     *     UIRouterModule.forRoot(routerConfig),
     *     FeatureModule1
     *   ]
     * })
     * class MyRootAppModule {}
     *
     * browserPlatformDynamic.bootstrapModule(MyRootAppModule);
     * ```
     *
     * @param config declarative UI-Router configuration
     * @returns an `NgModule` which provides the [[UIRouter]] singleton instance
     */
    UIRouterModule.forRoot = function (config) {
        if (config === void 0) { config = {}; }
        return {
            ngModule: UIRouterModule,
            providers: [
                _UIROUTER_INSTANCE_PROVIDERS,
                _UIROUTER_SERVICE_PROVIDERS,
                locationStrategy(config.useHash)
            ].concat(makeRootProviders(config))
        };
    };
    /**
     * Creates an `NgModule` for a UIRouter module
     *
     * This function creates an [Angular NgModule](https://angular.io/docs/ts/latest/guide/ngmodule.html)
     * with UI-Router support.
     *
     * #### Example:
     * ```js
     * var homeState = { name: 'home', url: '/home', component: Home };
     * var aboutState = { name: 'about', url: '/about', component: About };
     *
     * @ NgModule({
     *   imports: [
     *     UIRouterModule.forChild({ states: [ homeState, aboutState ] }),
     *     SharedModule,
     *   ],
     *   declarations: [ Home, About ],
     * })
     * export class AppModule {};
     * ```
     *
     * @param module UI-Router module options
     * @returns an `NgModule`
     */
    UIRouterModule.forChild = function (module) {
        if (module === void 0) { module = {}; }
        return {
            ngModule: UIRouterModule,
            providers: makeChildProviders(module),
        };
    };
    UIRouterModule.decorators = [
        { type: _angular_core.NgModule, args: [{
                    imports: [_angular_common.CommonModule],
                    declarations: [_UIROUTER_DIRECTIVES],
                    exports: [_UIROUTER_DIRECTIVES],
                    entryComponents: [UIView],
                },] },
    ];
    /** @nocollapse */
    UIRouterModule.ctorParameters = function () { return []; };
    return UIRouterModule;
}());

/**
 * Returns a function which lazy loads a nested module
 *
 * This is primarily used by the [[ng2LazyLoadBuilder]] when processing [[Ng2StateDeclaration.loadChildren]].
 *
 * It could also be used manually as a [[StateDeclaration.lazyLoad]] property to lazy load an `NgModule` and its state(s).
 *
 * #### Example:
 * Using `System.import()` and named export of `HomeModule`
 * ```js
 * declare var System;
 * var futureState = {
 *   name: 'home.**',
 *   url: '/home',
 *   lazyLoad: loadNgModule(() => System.import('./home/home.module').then(result => result.HomeModule))
 * }
 * ```
 *
 * #### Example:
 * Using a path (string) to the module
 * ```js
 * var futureState = {
 *   name: 'home.**',
 *   url: '/home',
 *   lazyLoad: loadNgModule('./home/home.module#HomeModule')
 * }
 * ```
 *
 *
 * @param moduleToLoad a path (string) to the NgModule to load.
 *    Or a function which loads the NgModule code which should
 *    return a reference to  the `NgModule` class being loaded (or a `Promise` for it).
 *
 * @returns A function which takes a transition, which:
 * - Gets the Injector (scoped properly for the destination state)
 * - Loads and creates the NgModule
 * - Finds the "replacement state" for the target state, and adds the new NgModule Injector to it (as a resolve)
 * - Returns the new states array
 */
function loadNgModule(moduleToLoad) {
    return function (transition) {
        var ng2Injector = transition.injector().get(uiRouterCore.NATIVE_INJECTOR_TOKEN);
        var createModule = function (factory) {
            return factory.create(ng2Injector);
        };
        var applyModule = function (moduleRef) {
            return applyNgModule(transition, moduleRef);
        };
        return loadModuleFactory(moduleToLoad, ng2Injector)
            .then(createModule)
            .then(applyModule);
    };
}
/**
 * Returns the module factory that can be used to instantiate a module
 *
 * For strings this:
 * - Finds the correct NgModuleFactoryLoader
 * - Loads the new NgModuleFactory from the path string (async)
 *
 * For a Type<any> or Promise<Type<any>> this:
 * - Compiles the component type (if not running with AOT)
 * - Returns the NgModuleFactory resulting from compilation (or direct loading if using AOT) as a Promise
 *
 * @internalapi
 */
function loadModuleFactory(moduleToLoad, ng2Injector) {
    if (uiRouterCore.isString(moduleToLoad)) {
        return ng2Injector.get(_angular_core.NgModuleFactoryLoader).load(moduleToLoad);
    }
    var compiler = ng2Injector.get(_angular_core.Compiler);
    var offlineMode = compiler instanceof _angular_core.Compiler;
    var unwrapEsModuleDefault = function (x) {
        return x && x.__esModule && x['default'] ? x['default'] : x;
    };
    var compileAsync = function (moduleType) {
        return compiler.compileModuleAsync(moduleType);
    };
    var loadChildrenPromise = Promise.resolve(moduleToLoad()).then(unwrapEsModuleDefault);
    return offlineMode ? loadChildrenPromise : loadChildrenPromise.then(compileAsync);
}
/**
 * Apply the UI-Router Modules found in the lazy loaded module.
 *
 * Apply the Lazy Loaded NgModule's newly created Injector to the right state in the state tree.
 *
 * Lazy loading uses a placeholder state which is removed (and replaced) after the module is loaded.
 * The NgModule should include a state with the same name as the placeholder.
 *
 * Find the *newly loaded state* with the same name as the *placeholder state*.
 * The NgModule's Injector (and ComponentFactoryResolver) will be added to that state.
 * The Injector/Factory are used when creating Components for the `replacement` state and all its children.
 *
 * @internalapi
 */
function applyNgModule(transition, ng2Module) {
    var injector = ng2Module.injector;
    var parentInjector = ng2Module.injector['parent'];
    var uiRouter = injector.get(uiRouterCore.UIRouter);
    var registry = uiRouter.stateRegistry;
    var originalName = transition.to().name;
    var originalState = registry.get(originalName);
    // Check if it's a future state (ends with .**)
    var isFuture = /^(.*)\.\*\*$/.exec(originalName);
    // Final name (without the .**)
    var replacementName = isFuture && isFuture[1];
    var newRootModules = multiProviderParentChildDelta(parentInjector, injector, UIROUTER_ROOT_MODULE)
        .reduce(uiRouterCore.uniqR, []);
    var newChildModules = multiProviderParentChildDelta(parentInjector, injector, UIROUTER_MODULE_TOKEN)
        .reduce(uiRouterCore.uniqR, []);
    if (newRootModules.length) {
        console.log(newRootModules);
        throw new Error('Lazy loaded modules should not contain a UIRouterModule.forRoot() module');
    }
    var newStateObjects = newChildModules
        .map(function (module) { return applyModuleConfig(uiRouter, injector, module); })
        .reduce(uiRouterCore.unnestR, [])
        .reduce(uiRouterCore.uniqR, []);
    var replacementState = registry.get(replacementName);
    if (!replacementState || replacementState === originalState) {
        throw new Error(("The Future State named '" + originalName + "' lazy loaded an NgModule. ") +
            ("The lazy loaded NgModule must have a state named '" + replacementName + "' ") +
            ("which replaces the (placeholder) '" + originalName + "' Future State. ") +
            ("Add a '" + replacementName + "' state to the lazy loaded NgModule ") +
            "using UIRouterModule.forChild({ states: CHILD_STATES }).");
    }
    // Supply the newly loaded states with the Injector from the lazy loaded NgModule.
    // If a tree of states is lazy loaded, only add the injector to the root of the lazy loaded tree.
    // The children will get the injector by resolve inheritance.
    var newParentStates = newStateObjects.filter(function (state) { return !uiRouterCore.inArray(newStateObjects, state.parent); });
    // Add the Injector to the top of the lazy loaded state tree as a resolve
    newParentStates.forEach(function (state) { return state.resolvables.push(uiRouterCore.Resolvable.fromData(uiRouterCore.NATIVE_INJECTOR_TOKEN, injector)); });
    return {};
}
/**
 * Returns the new dependency injection values from the Child Injector
 *
 * When a DI token is defined as multi: true, the child injector
 * can add new values for the token.
 *
 * This function returns the values added by the child injector,  and excludes all values from the parent injector.
 *
 * @internalapi
 */
function multiProviderParentChildDelta(parent, child, token) {
    var childVals = child.get(token, []);
    var parentVals = parent.get(token, []);
    return childVals.filter(function (val) { return parentVals.indexOf(val) === -1; });
}

/**
 * This is a [[StateBuilder.builder]] function for ngModule lazy loading in Angular.
 *
 * When the [[StateBuilder]] builds a [[State]] object from a raw [[StateDeclaration]], this builder
 * decorates the `lazyLoad` property for states that have a [[Ng2StateDeclaration.ngModule]] declaration.
 *
 * If the state has a [[Ng2StateDeclaration.ngModule]], it will create a `lazyLoad` function
 * that in turn calls `loadNgModule(loadNgModuleFn)`.
 *
 * #### Example:
 * A state that has a `ngModule`
 * ```js
 * var decl = {
 *   ngModule: () => System.import('./childModule.ts')
 * }
 * ```
 * would build a state with a `lazyLoad` function like:
 * ```js
 * import { loadNgModule } from "ui-router-ng2";
 * var decl = {
 *   lazyLoad: loadNgModule(() => System.import('./childModule.ts')
 * }
 * ```
 *
 * If the state has both a `ngModule:` *and* a `lazyLoad`, then the `lazyLoad` is run first.
 *
 * #### Example:
 * ```js
 * var decl = {
 *   lazyLoad: () => System.import('third-party-library'),
 *   ngModule: () => System.import('./childModule.ts')
 * }
 * ```
 * would build a state with a `lazyLoad` function like:
 * ```js
 * import { loadNgModule } from "ui-router-ng2";
 * var decl = {
 *   lazyLoad: () => System.import('third-party-library')
 *       .then(() => loadNgModule(() => System.import('./childModule.ts'))
 * }
 * ```
 *
 */
function ng2LazyLoadBuilder(state, parent) {
    var loadNgModuleFn = state['loadChildren'];
    return loadNgModuleFn ? loadNgModule(loadNgModuleFn) : state.lazyLoad;
}

var __extends$1 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/** A `LocationServices` that delegates to the Angular LocationStrategy */
var Ng2LocationServices = (function (_super) {
    __extends$1(Ng2LocationServices, _super);
    function Ng2LocationServices(router, _locationStrategy) {
        var _this = this;
        _super.call(this, router, true);
        this._locationStrategy = _locationStrategy;
        this._locationStrategy.onPopState(function (evt) {
            if (evt.type !== 'hashchange') {
                _this._listener(evt);
            }
        });
    }
    Ng2LocationServices.prototype._get = function () {
        return this._locationStrategy.path(true)
            .replace(this._locationStrategy.getBaseHref().replace(/\/$/, ''), '');
    };
    Ng2LocationServices.prototype._set = function (state, title, url, replace) {
        var _a = uiRouterCore.parseUrl(url), path = _a.path, search = _a.search, hash = _a.hash;
        var urlWithHash = path + (hash ? "#" + hash : "");
        if (replace) {
            this._locationStrategy.replaceState(state, title, urlWithHash, search);
        }
        else {
            this._locationStrategy.pushState(state, title, urlWithHash, search);
        }
    };
    Ng2LocationServices.prototype.dispose = function (router) {
        _super.prototype.dispose.call(this, router);
    };
    return Ng2LocationServices;
}(uiRouterCore.BaseLocationServices));

/** @module ng2 */
/** */
var __extends$2 = (undefined && undefined.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Ng2LocationConfig = (function (_super) {
    __extends$2(Ng2LocationConfig, _super);
    function Ng2LocationConfig(router, _locationStrategy) {
        _super.call(this, router, uiRouterCore.is(_angular_common.PathLocationStrategy)(_locationStrategy));
        this._locationStrategy = _locationStrategy;
    }
    Ng2LocationConfig.prototype.baseHref = function (href) {
        return this._locationStrategy.getBaseHref();
    };
    return Ng2LocationConfig;
}(uiRouterCore.BrowserLocationConfig));

/**
 * This is a factory function for a UIRouter instance
 *
 * Creates a UIRouter instance and configures it for Angular, then invokes router bootstrap.
 * This function is used as an Angular `useFactory` Provider.
 */
function uiRouterFactory(locationStrategy$$1, injector) {
    var rootModules = injector.get(UIROUTER_ROOT_MODULE);
    var modules = injector.get(UIROUTER_MODULE_TOKEN);
    if (rootModules.length !== 1) {
        throw new Error("Exactly one UIRouterModule.forRoot() should be in the bootstrapped app module's imports: []");
    }
    // ----------------- Create router -----------------
    // Create a new ng2 UIRouter and configure it for ng2
    var router = new uiRouterCore.UIRouter();
    // Add RxJS plugin
    router.plugin(uiRouterRx.UIRouterRx);
    // Add $q-like and $injector-like service APIs
    router.plugin(uiRouterCore.servicesPlugin);
    // ----------------- Monkey Patches ----------------
    // Monkey patch the services.$injector to use the root ng2 Injector
    uiRouterCore.services.$injector.get = injector.get.bind(injector);
    // ----------------- Configure for ng2 -------------
    router.locationService = new Ng2LocationServices(router, locationStrategy$$1);
    router.locationConfig = new Ng2LocationConfig(router, locationStrategy$$1);
    // Apply ng2 ui-view handling code
    var viewConfigFactory = function (path, config) { return new Ng2ViewConfig(path, config); };
    router.viewService._pluginapi._viewConfigFactory("ng2", viewConfigFactory);
    // Apply statebuilder decorator for ng2 NgModule registration
    var registry = router.stateRegistry;
    registry.decorator('views', ng2ViewsBuilder);
    registry.decorator('lazyLoad', ng2LazyLoadBuilder);
    // Prep the tree of NgModule by placing the root NgModule's Injector on the root state.
    var ng2InjectorResolvable = uiRouterCore.Resolvable.fromData(uiRouterCore.NATIVE_INJECTOR_TOKEN, injector);
    registry.root().resolvables.push(ng2InjectorResolvable);
    // Auto-flush the parameter type queue
    router.urlMatcherFactory.$get();
    // ----------------- Initialize router -------------
    rootModules.forEach(function (moduleConfig) { return applyRootModuleConfig(router, injector, moduleConfig); });
    modules.forEach(function (moduleConfig) { return applyModuleConfig(router, injector, moduleConfig); });
    // Start monitoring the URL
    if (!router.urlRouter.interceptDeferred) {
        router.urlService.listen();
        router.urlService.sync();
    }
    return router;
}
function parentUIViewInjectFactory(r) { return { fqn: null, context: r.root() }; }
var _UIROUTER_INSTANCE_PROVIDERS = [
    { provide: uiRouterCore.UIRouter, useFactory: uiRouterFactory, deps: [_angular_common.LocationStrategy, _angular_core.Injector] },
    { provide: UIView.PARENT_INJECT, useFactory: parentUIViewInjectFactory, deps: [uiRouterCore.StateRegistry] },
];
function fnStateService(r) { return r.stateService; }
function fnTransitionService(r) { return r.transitionService; }
function fnUrlMatcherFactory(r) { return r.urlMatcherFactory; }
function fnUrlRouter(r) { return r.urlRouter; }
function fnUrlService(r) { return r.urlService; }
function fnViewService(r) { return r.viewService; }
function fnStateRegistry(r) { return r.stateRegistry; }
function fnGlobals(r) { return r.globals; }
var _UIROUTER_SERVICE_PROVIDERS = [
    { provide: uiRouterCore.StateService, useFactory: fnStateService, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.TransitionService, useFactory: fnTransitionService, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.UrlMatcherFactory, useFactory: fnUrlMatcherFactory, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.UrlRouter, useFactory: fnUrlRouter, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.UrlService, useFactory: fnUrlService, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.ViewService, useFactory: fnViewService, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.StateRegistry, useFactory: fnStateRegistry, deps: [uiRouterCore.UIRouter] },
    { provide: uiRouterCore.UIRouterGlobals, useFactory: fnGlobals, deps: [uiRouterCore.UIRouter] },
];
/**
 * The UI-Router providers, for use in your application bootstrap
 *
 * @deprecated use [[UIRouterModule.forRoot]]
 */
var UIROUTER_PROVIDERS = _UIROUTER_INSTANCE_PROVIDERS.concat(_UIROUTER_SERVICE_PROVIDERS);

/** @ng2api @module ng2 */ /** for typedoc */

exports.ResolveData = ResolveData;
exports.uiRouterFactory = uiRouterFactory;
exports.parentUIViewInjectFactory = parentUIViewInjectFactory;
exports._UIROUTER_INSTANCE_PROVIDERS = _UIROUTER_INSTANCE_PROVIDERS;
exports.fnStateService = fnStateService;
exports.fnTransitionService = fnTransitionService;
exports.fnUrlMatcherFactory = fnUrlMatcherFactory;
exports.fnUrlRouter = fnUrlRouter;
exports.fnUrlService = fnUrlService;
exports.fnViewService = fnViewService;
exports.fnStateRegistry = fnStateRegistry;
exports.fnGlobals = fnGlobals;
exports._UIROUTER_SERVICE_PROVIDERS = _UIROUTER_SERVICE_PROVIDERS;
exports.UIROUTER_PROVIDERS = UIROUTER_PROVIDERS;
exports.UIROUTER_ROOT_MODULE = UIROUTER_ROOT_MODULE;
exports.UIROUTER_MODULE_TOKEN = UIROUTER_MODULE_TOKEN;
exports.UIROUTER_STATES = UIROUTER_STATES;
exports.makeRootProviders = makeRootProviders;
exports.makeChildProviders = makeChildProviders;
exports.locationStrategy = locationStrategy;
exports.UIRouterModule = UIRouterModule;
exports.applyModuleConfig = applyModuleConfig;
exports.applyRootModuleConfig = applyRootModuleConfig;
exports._UIROUTER_DIRECTIVES = _UIROUTER_DIRECTIVES;
exports.UIROUTER_DIRECTIVES = UIROUTER_DIRECTIVES;
exports.UIView = UIView;
exports.AnchorUISref = AnchorUISref;
exports.UISref = UISref;
exports.UISrefStatus = UISrefStatus;
exports.UISrefActive = UISrefActive;
exports.ng2ViewsBuilder = ng2ViewsBuilder;
exports.Ng2ViewConfig = Ng2ViewConfig;
exports.ng2LazyLoadBuilder = ng2LazyLoadBuilder;
exports.loadNgModule = loadNgModule;
exports.loadModuleFactory = loadModuleFactory;
exports.applyNgModule = applyNgModule;
exports.multiProviderParentChildDelta = multiProviderParentChildDelta;
Object.keys(uiRouterCore).forEach(function (key) { exports[key] = uiRouterCore[key]; });

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ui-router-ng2.js.map
