# Example Knative function

The point with FaaS is to focus on what your code is supposed to do, not how it is executed.
Source-to-URL can be seen as a different definition of the same thing.

There are many such platforms, but Knative is designed as a standard that platforms can implement.
The promise is that your logic can be vendor neutral.

A prospective end user would use Knative through a frontend or CLI.
The `kubectl` commands in the example below would be hidden to the end user.
Source-to-URL means the end user need only to know how to:
 * Push source to a repo.
 * Associate this source with a build template.
 * Decide which revision(s) that should receive traffic.
 * Hit the public URL.

## Chosing a runtime

Given that your function is a piece of code, possibly importing other pieces and libraries,
you need to select a _runtime_.
Your organization will likely want to standarize on a couple of runtimes,
matched with coding conventions.

With Knative your code will run as an HTTP/gRPC server.
Your function is a handler for incoming requests or events,
and the wrapping of that handler can be seen as boilerplate.
Ultimately, in year 2018, that wrapping is a container image.

## Push source to a repo

Our repository contains one or more "example-" folders with source that should be supported.
That's how we scope and test the build template.

First, clone or fork this repository.
Being vendor neutral as promised, to `kubectl apply` the example you need a [Knative cluster](https://github.com/knative/docs/blob/master/install/README.md).

However, two aspects are not vendor neutral:

 * The domain of the URLs that point to your cluster.
 * The image URLs, your registry for runtime container images.

The examples here use the suffix `example.com` and prefix `registry.example.com`, respectively.

### Using Riff's invoker as Node.js runtime

We evaluated [Kubeless](https://kubeless.io/),
[Buildpack](https://docs.cloudfoundry.org/buildpacks/),
and [Riff](https://projectriff.io/invokers/) for this example.
Our conclusions in essence:

 * Kubeless has quite a bit of legacy.
 * While supporting multiple languages, Buildpack does the build but doesn't actually provide an invoker for your function.
 * Riff's nodejs invoker supports both standalone functions and full Node.js modules.

Hence we settled for riff now, and we think that we can switch runtime. Riff's function model is very simple, as in this square example:

```nodejs
module.exports = x => x * x;
```

Our example function will depend on an additional source file and a 3rd party library.
For production builds we adhere to new-ish [npm](https://blog.npmjs.org/post/171556855892/introducing-npm-ci-for-faster-more-reliable) conventions,
using `package-lock.json` with [npm ci](https://docs.npmjs.com/cli/ci).

## Source-to-Revision

... or -to-container-image.

With a Kubernetes background you can actually dive right into:
https://github.com/knative/serving/blob/v0.1.1/docs/spec/spec.md#configuration



## Workflow using kubectl

```bash
kubectl create -f build01.yaml
```

List configurations and their age:
```bash
kubectl get configuration.serving.knative.dev
```

Optionally use `kubectl describe configuration.serving.knative.dev/[name from list]` to see status.

List the builds that have been generated:
```bash
kubectl get build.build.knative.dev
```

Builds sometimes fail, so let's hope your Knative vendor provides easy [access to logs](https://github.com/knative/docs/blob/master/serving/accessing-logs.md) indexed for your build.
In the meantime let's use `kubectl` and the step names from the build template
(assuming the generated steps "creds-initializer" and "git-source" succeed).

```
SELECTOR="build-name=runtime-nodejs-example-module-00001"
kubectl logs -l $SELECTOR -c build-step-dockerfile
kubectl logs -l $SELECTOR -c build-step-export
```

If your build passes, wait for pods to start. Now your logs are found using:

```bash
kubectl logs -l serving.knative.dev/configuration=runtime-nodejs-example-module -c user-container
```

## TODOs

 * Switch to source examples living in this repo
 * Document replacement of registry host, and the service account
