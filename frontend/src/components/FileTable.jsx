export default function FileTable({ files, onSelect }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-left text-sm">
        <thead className="bg-white/5 text-slate-300">
          <tr>
            <th className="px-4 py-3">File</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">Encryption</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {files.map((file) => (
            <tr
              key={file._id}
              className="cursor-pointer bg-slate-950/20 transition hover:bg-white/5"
              onClick={() => onSelect(file)}
            >
              <td className="px-4 py-4">
                <div className="font-medium text-white">{file.originalName}</div>
                <div className="text-xs text-slate-400">{file.mimeType}</div>
              </td>
              <td className="px-4 py-4 text-slate-300">{file.owner?.email || "Unknown"}</td>
              <td className="px-4 py-4 text-slate-300">{file.size} bytes</td>
              <td className="px-4 py-4 text-sky-200">{file.encryptionStatus}</td>
              <td className="px-4 py-4 text-slate-300">
                {new Date(file.lastModifiedAt || file.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
