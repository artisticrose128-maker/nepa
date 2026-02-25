
# NGINX Blue-Green Load Balancer Configuration

This directory contains the NGINX configuration for implementing a Blue-Green deployment strategy.

## Structure

- `nginx.conf`: The main NGINX configuration file.
- `conf.d/app.conf`: The application-specific configuration that handles traffic splitting.

## Traffic Splitting Mechanism

The configuration uses NGINX `map` directives to control traffic routing dynamically.

1.  **Default Upstream**: Controlled by the `map $host $active_upstream` block in `conf.d/app.conf`.
    -   `blue_backend`: Points to the Blue environment.
    -   `green_backend`: Points to the Green environment.

2.  **Overrides**:
    -   **Header**: `x-deploy-version: green` forces traffic to Green.
    -   **Cookie**: `x-deploy-version=green` forces traffic to Green.

## Deployment Workflow

To switch traffic from Blue to Green:

1.  **Deploy Green**: Ensure the Green environment is running.
2.  **Test Green**: Use the cookie or header to verify Green.
    ```bash
    curl -H "x-deploy-version: green" http://your-load-balancer/health
    ```
3.  **Switch Traffic**: Update `conf.d/app.conf` to change the default upstream.
    ```nginx
    map $host $active_upstream {
        default green_backend; 
    }
    ```
4.  **Reload NGINX**:
    ```bash
    nginx -s reload
    ```
    This applies the change with zero downtime.

## Integration with CI/CD

The provided GitHub Actions workflow can be adapted to update this file and reload NGINX if you are not using Kubernetes Services for traffic switching.
