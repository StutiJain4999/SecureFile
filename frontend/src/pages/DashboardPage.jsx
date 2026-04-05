import { useEffect, useState } from "react";
import AdminPanel from "../components/AdminPanel";
import FeatureOrbit from "../components/FeatureOrbit";
import FeatureSpotlight from "../components/FeatureSpotlight";
import FileTable from "../components/FileTable";
import HeroMetrics from "../components/HeroMetrics";
import SecurityGraphPanel from "../components/SecurityGraphPanel";
import StatusBanner from "../components/StatusBanner";
import ThreatRadar from "../components/ThreatRadar";
import {
  createShareLink,
  deleteFile,
  downloadFile,
  fetchFiles,
  fetchLogs,
  fetchUsers,
  shareFileWithUser,
  toggleUserStatus,
  updateFileContent,
  uploadFile
} from "../services/fileService";
import { setupTwoFactor, verifyTwoFactor } from "../services/authService";

export default function DashboardPage({ user, onLogout }) {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorContent, setEditorContent] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareLevel, setShareLevel] = useState("read");
  const [shareExpiry, setShareExpiry] = useState(120);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ message: "", tone: "info" });
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [otp, setOtp] = useState("");

  const getPermission = (file) => {
    if (!file) {
      return null;
    }

    if (user.role === "admin") {
      return "write";
    }

    const ownerId =
      typeof file.owner === "string" ? file.owner : file.owner?._id;

    if (ownerId === user.id) {
      return "write";
    }

    const sharedRecord = file.sharedWith?.find((entry) => {
      const sharedUserId =
        typeof entry.user === "string" ? entry.user : entry.user?._id;
      return sharedUserId === user.id;
    });

    return sharedRecord?.level || null;
  };

  const selectedPermission = getPermission(selectedFile);
  const canWriteSelectedFile = selectedPermission === "write";
  const ownedFiles = files.filter((file) => {
    const ownerId = typeof file.owner === "string" ? file.owner : file.owner?._id;
    return ownerId === user.id;
  });
  const sharedFiles = files.filter((file) => {
    const ownerId = typeof file.owner === "string" ? file.owner : file.owner?._id;
    return ownerId !== user.id;
  });

  const heroMetrics = [
    {
      label: "Protected Files",
      value: files.length,
      helper: "Encrypted records visible in your workspace",
      tag: "AES-256",
      tone: "sky"
    },
    {
      label: "Owned Assets",
      value: ownedFiles.length,
      helper: "Files you directly control and can share",
      tag: "RBAC",
      tone: "emerald"
    },
    {
      label: "Shared Access",
      value: sharedFiles.length,
      helper: "Records visible through delegated permissions",
      tag: "Share",
      tone: "amber"
    },
    {
      label: "Admin Logs",
      value: user.role === "admin" ? logs.length : "24/7",
      helper:
        user.role === "admin"
          ? "Audit entries currently visible"
          : "Audit monitoring active for every sensitive action",
      tag: "Audit",
      tone: "rose"
    }
  ];

  const graphMetrics = [
    {
      label: "Authentication Controls",
      value: 92,
      helper: "Password policy, JWT sessions, and TOTP onboarding are present.",
      gradient: "from-sky-400 to-cyan-300"
    },
    {
      label: "Threat Protection",
      value: 84,
      helper: "Upload validation, suspicious signature checks, and rate defense exist.",
      gradient: "from-rose-400 to-orange-300"
    },
    {
      label: "Encryption Coverage",
      value: 96,
      helper: "Stored files are encrypted before persistence with wrapped file keys.",
      gradient: "from-emerald-400 to-lime-300"
    },
    {
      label: "Access Governance",
      value: 88,
      helper: "Ownership, RBAC, and file-level permissions are enforced server-side.",
      gradient: "from-amber-300 to-yellow-200"
    }
  ];

  const radarItems = [
    {
      label: "Malware Uploads",
      value: 0.81,
      helper: "Suspicious extensions and known test signatures are blocked."
    },
    {
      label: "Brute Force",
      value: 0.72,
      helper: "Account lock logic still exists even after removing route throttling."
    },
    {
      label: "XSS / Input Abuse",
      value: 0.77,
      helper: "Sanitization and payload inspection reduce hostile client input."
    },
    {
      label: "Unauthorized Access",
      value: 0.9,
      helper: "Permission checks run before read, write, and share operations."
    },
    {
      label: "Data Exposure",
      value: 0.86,
      helper: "Encrypted-at-rest storage and expiring share tokens reduce exposure."
    }
  ];

  const spotlightItems = [
    {
      kicker: "Authentication",
      title: "Password + TOTP Login",
      description:
        "Users authenticate with strong passwords and can activate authenticator-based two-factor protection.",
      status: "Visible in dashboard"
    },
    {
      kicker: "Encryption",
      title: "Files Encrypted Before Storage",
      description:
        "Each upload is encrypted with AES-256-GCM and persisted only after the secure transform completes.",
      status: "Active on upload"
    },
    {
      kicker: "RBAC",
      title: "Role-Based Access Control",
      description:
        "Admins, owners, and delegated users each see actions that match the permissions enforced by the backend.",
      status: "Server enforced"
    },
    {
      kicker: "Sharing",
      title: "Direct Share + Expiring Tokens",
      description:
        "Files can be shared with named users or through temporary secret tokens for limited access windows.",
      status: "Interactive"
    },
    {
      kicker: "Threat Defense",
      title: "Upload Screening",
      description:
        "The system rejects oversized or risky uploads and can be extended with ClamAV for stronger scanning.",
      status: "Built in"
    },
    {
      kicker: "Auditing",
      title: "Admin Log Visibility",
      description:
        "Sensitive actions generate audit trails that admins can inspect from the same dashboard experience.",
      status: "Admin panel"
    }
  ];

  const loadData = async () => {
    try {
      const fileData = await fetchFiles();
      setFiles(fileData);
      if (user.role === "admin") {
        const [logData, userData] = await Promise.all([fetchLogs(), fetchUsers()]);
        setLogs(logData);
        setUsers(userData);
      }
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to load dashboard data",
        tone: "danger"
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [user.role]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      await uploadFile(file);
      setStatus({ message: "File uploaded and encrypted successfully.", tone: "success" });
      await loadData();
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "File upload failed",
        tone: "danger"
      });
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    if (!window.confirm(`Permanently delete "${selectedFile.originalName}"? This cannot be undone.`)) return;

    try {
      await deleteFile(selectedFile._id);
      setStatus({ message: "File deleted and removed from storage.", tone: "success" });
      setSelectedFile(null);
      setEditorContent("");
      await loadData();
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to delete file",
        tone: "danger"
      });
    }
  };

  const handleUpdateFile = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      await updateFileContent(selectedFile._id, editorContent);
      setStatus({ message: "File content updated securely.", tone: "success" });
      await loadData();
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to update file",
        tone: "danger"
      });
    }
  };

  const handleShareWithUser = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      await shareFileWithUser(selectedFile._id, shareEmail, shareLevel);
      setStatus({ message: "File shared with user successfully.", tone: "success" });
      setShareEmail("");
      await loadData();
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to share file",
        tone: "danger"
      });
    }
  };

  const handleCreateLink = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      const data = await createShareLink(selectedFile._id, Number(shareExpiry));
      setStatus({
        message: `Share token created: ${data.token} (expires ${new Date(data.expiresAt).toLocaleString()})`,
        tone: "success"
      });
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to create shared link",
        tone: "danger"
      });
    }
  };

  const handleSetupTwoFactor = async () => {
    try {
      const data = await setupTwoFactor();
      setTwoFactorSetup(data);
      setStatus({ message: "Scan the QR code and confirm with an OTP.", tone: "success" });
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "Unable to start two-factor setup",
        tone: "danger"
      });
    }
  };

  const handleVerifyTwoFactor = async () => {
    try {
      const data = await verifyTwoFactor(otp);
      setStatus({ message: data.message, tone: "success" });
      setTwoFactorSetup(null);
      setOtp("");
    } catch (error) {
      setStatus({
        message: error.response?.data?.message || "OTP verification failed",
        tone: "danger"
      });
    }
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Protected workspace</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Secure File Console</h1>
          <p className="mt-2 text-slate-300">
            Logged in as {user.name} ({user.role})
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="button-secondary cursor-pointer">
            Upload file
            <input className="hidden" type="file" onChange={handleFileUpload} />
          </label>
          <button className="button-secondary" onClick={handleSetupTwoFactor}>
            Enable 2FA
          </button>
          <button
            className="button-secondary"
            onClick={() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              onLogout();
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mb-6">
        <StatusBanner message={status.message} tone={status.tone} />
      </div>

      <div className="space-y-6">
        <HeroMetrics metrics={heroMetrics} />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <FeatureOrbit />
          <SecurityGraphPanel metrics={graphMetrics} />
        </div>

        <ThreatRadar items={radarItems} />
        <FeatureSpotlight items={spotlightItems} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Accessible Files</h2>
            <span className="text-sm text-slate-400">{files.length} visible records</span>
          </div>
          <FileTable
            files={files}
            onSelect={(file) => {
              setSelectedFile(file);
              setEditorContent("");
            }}
          />
        </section>

        <aside className="panel p-6">
          <h2 className="text-2xl font-semibold text-white">File Actions</h2>
          {selectedFile ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="font-medium text-white">{selectedFile.originalName}</div>
                <div className="mt-2 text-sm text-slate-300">
                  Owner: {selectedFile.owner?.email || "Unknown"}
                </div>
                <div className="text-sm text-slate-300">
                  Your access: {selectedPermission || "none"}
                </div>
                <div className="text-sm text-slate-300">Size: {selectedFile.size} bytes</div>
                <div className="text-sm text-slate-300">
                  Last access:{" "}
                  {selectedFile.lastAccessedAt
                    ? new Date(selectedFile.lastAccessedAt).toLocaleString()
                    : "Never"}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="inline-flex text-sm font-semibold text-sky-300"
                    onClick={() => downloadFile(selectedFile._id, selectedFile.originalName)}
                  >
                    Download decrypted file
                  </button>
                  {canWriteSelectedFile && (
                    <button
                      className="inline-flex text-sm font-semibold text-rose-400 hover:text-rose-300"
                      onClick={handleDeleteFile}
                    >
                      Delete file
                    </button>
                  )}
                </div>
              </div>

              <textarea
                className="input min-h-40"
                placeholder="Update text content for this file"
                value={editorContent}
                disabled={!canWriteSelectedFile}
                onChange={(event) => setEditorContent(event.target.value)}
              />
              <button
                className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canWriteSelectedFile}
                onClick={handleUpdateFile}
              >
                Save Content Securely
              </button>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <h3 className="font-semibold text-white">Share with a user</h3>
                {!canWriteSelectedFile && (
                  <p className="mt-2 text-sm text-amber-200">
                    Only the owner, an admin, or a user with write access can share this file.
                  </p>
                )}
                <div className="mt-3 space-y-3">
                  <input
                    className="input"
                    placeholder="Recipient email"
                    disabled={!canWriteSelectedFile}
                    value={shareEmail}
                    onChange={(event) => setShareEmail(event.target.value)}
                  />
                  <select
                    className="input"
                    disabled={!canWriteSelectedFile}
                    value={shareLevel}
                    onChange={(event) => setShareLevel(event.target.value)}
                  >
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                  </select>
                  <button
                    className="button-secondary w-full disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canWriteSelectedFile}
                    onClick={handleShareWithUser}
                  >
                    Grant Access
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <h3 className="font-semibold text-white">Create expiring share token</h3>
                <div className="mt-3 flex gap-3">
                  <input
                    className="input"
                    type="number"
                    min="5"
                    disabled={!canWriteSelectedFile}
                    value={shareExpiry}
                    onChange={(event) => setShareExpiry(event.target.value)}
                  />
                  <button
                    className="button-secondary disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!canWriteSelectedFile}
                    onClick={handleCreateLink}
                  >
                    Create Token
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-300">Select a file to inspect metadata and perform secure actions.</p>
          )}

          {twoFactorSetup && (
            <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
              <h3 className="font-semibold text-white">Two-factor setup</h3>
              <img className="mt-4 w-full rounded-2xl bg-white p-3" src={twoFactorSetup.qrCodeDataUrl} alt="2FA QR code" />
              <p className="mt-3 break-all text-xs text-slate-200">{twoFactorSetup.secret}</p>
              <div className="mt-3 flex gap-3">
                <input className="input" placeholder="Enter OTP" value={otp} onChange={(event) => setOtp(event.target.value)} />
                <button className="button-primary" onClick={handleVerifyTwoFactor}>
                  Verify
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {user.role === "admin" && (
        <div className="mt-6">
          <AdminPanel logs={logs} users={users} onToggleUser={async (userId, isActive) => {
            await toggleUserStatus(userId, isActive);
            await loadData();
          }} />
        </div>
      )}
    </div>
  );
}
