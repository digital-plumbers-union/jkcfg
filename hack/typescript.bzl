load("@npm_bazel_typescript//:index.bzl", _ts_library = "ts_library")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test", "pkg_npm")
load("//hack/deps:deps.bzl", deps_deps = "deps")
load("//hack/package-json:deps.bzl", pkg_json_deps = "deps")

def ts_library(name, srcs, deps, tsconfig = "//:tsconfig.json"):
    """Minimum ts_library target that works with jkcfg"""
    return _ts_library(
        name = name,
        srcs = srcs,
        deps = deps,
        runtime = "node",
        # configure module name so that our code resolves modules correctly
        # locally & when published
        module_name = "@dpu/" + name,
        # force ts_library to always produce ES6 compatible outputs because
        # this code will always be consumed by `jk`
        devmode_module = "es2015",
        devmode_target = "es2017",
        prodmode_module = "es2015",
        prodmode_target = "es2017",
        tsconfig = tsconfig,
    )

def package_json(pkg_json):
    """Ensures that package.json for individual modules is in sync with the base
    package.json config"""
    return [
        nodejs_test(
            name = "check_pkg_json",
            data = [pkg_json, "//hack/package-json:check"] + pkg_json_deps,
            entry_point = "//hack/package-json:check.ts",
            templated_args = ["$$(rlocation $(rootpath " + pkg_json + "))"],
        ),
        nodejs_binary(
            name = "update_pkg_json",
            data = [pkg_json, "//hack/package-json:update"] + pkg_json_deps,
            entry_point = "//hack/package-json:update.ts",
            templated_args = ["$$(rlocation $(rootpath " + pkg_json + "))"],
        ),
    ]

def dependencies(pkg_json):
    """Ensures that the package dependencies match the versions in the base
       package.json"""
    return [
        nodejs_test(
            name = "check_deps",
            data = [pkg_json, "//:package.json", "//hack/deps:check"] + deps_deps,
            entry_point = "//hack/deps:check.ts",
            templated_args = ["$$(rlocation $(rootpath " + pkg_json + "))"],
        ),
        nodejs_binary(
            name = "update_deps",
            data = [pkg_json, "//:package.json", "//hack/deps:update"] + deps_deps,
            entry_point = "//hack/deps:update.ts",
            templated_args = ["$$(rlocation $(rootpath " + pkg_json + "))"],
        ),
    ]

def npm(label, name):
    """Defaults for pkg_npm"""
    pkg_npm(
        name = "npm_package",
        srcs = [
            label + ":package.json",
        ],
        deps = [
            # maps to something like //apps/bazel-remote-cache:app, which would be
            # the typescript library (aka .d.ts files)
            label + ":" + name,
        ],
    )

def app(label, name = "app", srcs = ["index.ts", "lib.ts", "params.ts"], deps = []):
    """Creates required targets for building and publishing an application definition
    for jkcfg to npm"""
    return [
        ts_library(name, srcs, deps + ["//lib/k8s:jkcfg-k8s", "@npm//@jkcfg/std", "@npm//@jkcfg/kubernetes"]),
        npm(
            name = name,
            label = label,
        ),
    ] + dependencies(label + ":package.json") + package_json(label + ":package.json")

def lib(label, name = "lib", srcs = [], deps = [], tsconfig = "//:tsconfig.json"):
    """Creates required targets for building and publishing libraries for jkcfg to
    npm"""
    return [
        ts_library(name, srcs, deps, tsconfig),
        npm(
            name = name,
            label = label,
        ),
    ] + dependencies(label + ":package.json") + package_json(label + ":package.json")
