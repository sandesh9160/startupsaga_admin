type JsonLdProps = {
  data: Record<string, any>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD must be a single JSON string.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
