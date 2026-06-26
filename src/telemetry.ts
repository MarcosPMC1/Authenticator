import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { metrics } from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_URL_FULL,
} from '@opentelemetry/semantic-conventions';

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (!otlpEndpoint) {
  console.warn(
    '[WARN] OTEL_EXPORTER_OTLP_ENDPOINT não está definido. ' +
    'A instrumentação OpenTelemetry não será iniciada e nenhuma métrica/trace/log será enviado.',
  );
} else {
  // Create Resource
  const resource = resourceFromAttributes({
    'service.name': 'auth-api',
    'service.version': '1.0.0',
  });

  // Configure Exporters using endpoints from env or standard default fallback URLs
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
         `${otlpEndpoint}/v1/traces`,
  });

  const metricExporter = new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
         `${otlpEndpoint}/v1/metrics`,
  });

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 15000,
    exportTimeoutMillis: 5000,
  });

  const logExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT ||
         `${otlpEndpoint}/v1/logs`,
  });

  // Initialize OpenTelemetry Node SDK
  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader,
    // BatchLogRecordProcessor is preferred over SimpleLogRecordProcessor in production:
    // it batches log records and flushes them periodically, reducing network overhead.
    logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable noisy file system auto-instrumentation
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        // HTTP instrumentation: captures method, status_code, url, route, and duration
        // for every inbound and outbound HTTP request automatically.
        '@opentelemetry/instrumentation-http': {
          enabled: true,
          // Attach request/response headers as span attributes (opt-in for security)
          requestHook: (span, request) => {
            // 'IncomingMessage' means inbound request (server-side)
            if ('method' in request) {
              span.setAttribute(ATTR_HTTP_REQUEST_METHOD, request.method ?? 'UNKNOWN');
              span.setAttribute(ATTR_URL_FULL, (request as any).url ?? '');
            }
          },
          responseHook: (span, response) => {
            if ('statusCode' in response) {
              span.setAttribute(
                ATTR_HTTP_RESPONSE_STATUS_CODE,
                response.statusCode ?? 0,
              );
            }
          },
        },
        // Express instrumentation resolves http.route to the pattern (e.g. /auth/:id)
        // instead of the raw URL, which is essential for meaningful grouping in dashboards.
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
      }),
    ],
  });

  // Start the OpenTelemetry SDK
  try {
    sdk.start();
    console.log('OpenTelemetry SDK initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OpenTelemetry SDK', error);
  }

  // Gracefully shut down the SDK on process termination
  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('OpenTelemetry SDK terminated'))
      .catch((error) => console.log('Error terminating OpenTelemetry SDK', error))
      .finally(() => process.exit(0));
  });
}

// ---------------------------------------------------------------------------
// Custom Metrics
// ---------------------------------------------------------------------------
// These instruments are no-ops when the SDK is not initialized (no endpoint),
// so they are safe to export and use unconditionally throughout the app.

export const meterProvider = metrics.getMeterProvider();
export const meter = metrics.getMeter('auth-api');

/**
 * Counts each login attempt, tagged with the outcome.
 * Usage: loginCounter.add(1, { 'auth.result': 'success' | 'failure' });
 */
export const loginCounter = meter.createCounter('auth.login.count', {
  description: 'Number of login attempts',
  unit: '1',
});

/**
 * Counts user registration attempts.
 * Usage: registrationCounter.add(1, { 'auth.result': 'success' | 'failure' });
 */
export const registrationCounter = meter.createCounter('auth.registration.count', {
  description: 'Number of user registration attempts',
  unit: '1',
});

/**
 * Tracks how long authentication operations take (login, token generation).
 * Usage: authDurationHistogram.record(durationMs, { 'auth.operation': 'login' | 'refresh' });
 */
export const authDurationHistogram = meter.createHistogram('auth.operation.duration', {
  description: 'Duration of authentication operations in milliseconds',
  unit: 'ms',
});

/**
 * Counts how many tokens are issued.
 * Usage: tokenIssuedCounter.add(1, { 'token.type': 'access' | 'refresh' });
 */
export const tokenIssuedCounter = meter.createCounter('auth.token.issued', {
  description: 'Number of JWT tokens issued',
  unit: '1',
});