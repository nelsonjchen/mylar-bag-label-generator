import { Container } from "@cloudflare/containers";

export class MyContainer extends Container {
    // Configure the container
    defaultPort = 3000;
    // sleepAfter = '10s';
    // envVars = {
    // 	MESSAGE: 'Hello from the container!',
    // };

    override onStart() {
        console.log('Container successfully started');
    }

    override onStop() {
        console.log('Container successfully shut down');
    }

    override onError(error: unknown) {
        console.log('Container error:', error);
    }
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // Route all requests to the container
        // We use a singleton-like pattern here for simplicity, or just get a named instance
        // For a single app, we can just use a fixed name like "app"
        const container = env.MY_CONTAINER.getByName("app");

        return await container.fetch(request);
    },
};

interface Env {
    MY_CONTAINER: DurableObjectNamespace<MyContainer>;
}
