load("//hack:typescript.bzl", "app")

package(default_visibility = ["//visibility:public"])

app(
    name = "tautulli",
    srcs = glob(["**/*.ts"]),
    label = "//apps/tautulli",
    deps = [
        "@npm//@types/lodash-es",
        "@npm//lodash-es",
    ],
)
