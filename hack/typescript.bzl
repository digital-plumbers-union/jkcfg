load("@npm_bazel_typescript//:index.bzl", _ts_library = "ts_library")
load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm", "nodejs_binary", "nodejs_test")
load("//hack/deps:deps.bzl", deps_deps = "deps")

def ts_library(name, srcs, deps):
  """Minimum ts_library target that works with jkcfg"""
  return _ts_library(
    name = name,
    srcs = srcs,
    deps = deps,
    runtime = "node",
    prodmode_module = "es2015",
    prodmode_target = "es2017",
  ) 

def dist(lib, name = "dist"):
  """Minimum filegroup referencing build .mjs files"""
  return native.filegroup(name = name, srcs = [lib], output_group = "es6_sources")

def deps_targets(pkg_json = ":package.json"):
  return [
    nodejs_test(
      name = "check_deps",
      data = [pkg_json, "//:package.json", "//hack/deps:check"] + deps_deps,
      entry_point = "//hack/deps:check.ts",
      templated_args = ["$$(rlocation $(rootpath " + pkg_json + "))"]
    ),
    nodejs_binary(
      name = "update_deps",
      data = [pkg_json, "//:package.json", "//hack/deps:update"] + deps_deps,
      entry_point = "//hack/deps:update.ts",
      templated_args = ["$$(rlocation $(rootpath " + pkg_json + "))"]
    )
  ]

def app(name = "app", srcs = ["index.ts", "lib.ts", "params.ts"], deps = []):
  """Creates required targets for building and publishing an application definition
  for jkcfg to npm"""
  return [
    ts_library(name, srcs, deps + ["@npm//@dpu/jkcfg-k8s", "@npm//@jkcfg/std", "@npm//@jkcfg/kubernetes"]),
    dist(lib = name),
    # TODO: pkg json generation
    # TODO: pkg_npm target
  ] + deps_targets()

# pkg_npm(
#     name = "npm_package",
#     srcs = [
#         "@npm_bazel_typescript//:package_contents",
#     ],
#     build_file_content = "",
#     nested_packages = [
#         "@build_bazel_rules_typescript//:npm_bazel_typescript_package",
#     ],
#     substitutions = TYPESCRIPT_REPLACEMENTS,
#     vendor_external = [
#         "npm_bazel_typescript",
#         "build_bazel_rules_typescript",
#     ],
#     deps = [
#         ":npm_version_check",
#         "@npm_bazel_typescript//internal:BUILD",
#         "@npm_bazel_typescript//internal:ts_project_options_validator.js",
#     ] + select({
#         # FIXME: fix stardoc on Windows; @npm_bazel_typescript//:index.md generation fails with:
#         #   ERROR: D:/b/62unjjin/external/npm_bazel_typescript/BUILD.bazel:36:1: Couldn't build file
#         #   external/npm_bazelnpm_bazel_typescript_terser/docs.raw: Generating proto for Starlark doc for docs failed (Exit 1)
#         "@bazel_tools//src/conditions:windows": [],
#         "//conditions:default": [":generate_README"],
#     }),
# )