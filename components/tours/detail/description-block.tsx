import ReactMarkdown from 'react-markdown';

export function DescriptionBlock({ md }: { md: string | null }) {
  if (!md) return null;
  return (
    <div className="prose prose-neutral max-w-none text-body-md text-body">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => <h2 className="text-display-md mt-6 text-ink" {...props} />,
          h2: ({ ...props }) => <h3 className="text-display-sm mt-6 text-ink" {...props} />,
          a: ({ ...props }) => (
            <a className="text-ink underline underline-offset-2 hover:text-primary" {...props} />
          ),
          ul: ({ ...props }) => <ul className="my-3 list-disc pl-6" {...props} />,
          ol: ({ ...props }) => <ol className="my-3 list-decimal pl-6" {...props} />,
          li: ({ ...props }) => <li className="my-1" {...props} />,
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}
