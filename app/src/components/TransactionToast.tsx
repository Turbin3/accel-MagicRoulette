export function TransactionToast({
  title,
  link,
}: {
  title: string;
  link: string;
}) {
  return (
    <div className="flex flex-col">
      <p className="font-semibold">{title}</p>
      <a href={link} target="_blank" className="text-info underline">
        View Transaction
      </a>
    </div>
  );
}
