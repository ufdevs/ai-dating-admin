import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Users,
  Bot,
  Sparkles,
  Palette,
  CreditCard,
  Sliders,
  Shield,
  Bell,
  Activity,
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  X,
  LogOut,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  MessageSquare,
  PhoneCall,
  Layers,
  Globe,
  RefreshCw,
  Menu,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function App() {
  const defaultApiUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v2";

  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem("admin_token") || "";
    // Clear stale or mock session tokens
    if (saved.startsWith("admin_session_")) {
      localStorage.removeItem("admin_token");
      return "";
    }
    return saved;
  });

  const [baseUrl, setBaseUrl] = useState(() => {
    const saved = localStorage.getItem("admin_base_url");
    if (!saved || saved.includes("localhost:3000")) {
      return defaultApiUrl;
    }
    return saved;
  });

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const saved = localStorage.getItem("admin_token") || "";
    return !!saved && !saved.startsWith("admin_session_");
  });

  // App navigation state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dashboard Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalPersonas: 0,
    totalSessions: 0,
    totalCalls: 0,
    tierBreakdown: [],
  });

  // Personas state
  const [personas, setPersonas] = useState([]);
  const [personaSearch, setPersonaSearch] = useState("");
  const [personaGenderFilter, setPersonaGenderFilter] = useState("all");
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [personaForm, setPersonaForm] = useState({
    name: "",
    bio: "",
    gender: "female",
    avatarUrl: "",
    photos: [],
    relationshipDynamic: "romantic-partner",
    personalityTraits: ["sweet", "playful", "romantic"],
    interests: ["travel", "music", "movies"],
    voiceStyle: "sweet",
    accentColor: "#FF4B72",
    language: ["en", "hi"],
    isPremium: false,
    isActive: true,
    livekitEnabled: true,
    openrouterModel: "meta-llama/llama-3.3-70b-instruct",
    temperature: 0.85,
    maxTokens: 400,
    systemPromptTemplate: "",
  });
  const [newTrait, setNewTrait] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Subscriptions & System Config
  const [sysConfig, setSysConfig] = useState({
    freeTextLimit: 20,
    freeVoiceLimit: 5,
    freeCallMinutes: 3,
    basicTextLimit: 150,
    basicVoiceLimit: 50,
    basicCallMinutes: 30,
    premiumTextLimit: -1,
    premiumVoiceLimit: -1,
    premiumCallMinutes: 120,
    openRouterApiKey: "",
    openRouterModel: "meta-llama/llama-3.3-70b-instruct",
    openRouterFallbackModels: "",
    livekitUrl: "",
    livekitApiKey: "",
    livekitApiSecret: "",
    remoteThemeConfig: {
      version: 1,
      primaryColor: "#FF4B72",
      secondaryColor: "#7C4DFF",
      accentColor: "#FF8E53",
      surfaceColorLight: "#FFFFFF",
      surfaceColorDark: "#161329",
      backgroundColorDark: "#0A0814",
      fontFamily: "Outfit",
      borderRadius: 16,
    },
    featureFlags: {
      liveCallsEnabled: true,
      voiceChatEnabled: true,
      aiTranscriptCorrectionEnabled: true,
      inAppPurchasesEnabled: true,
      discoveryProfilesEnabled: true,
      customPersonaCreationEnabled: true,
      maintenanceMode: false,
    },
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userTierFilter, setUserTierFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Subscriptions list
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);

  // Moderation & Support
  const [reports, setReports] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Push broadcast
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTargetTier, setBroadcastTargetTier] = useState("all");

  const [notificationMsg, setNotificationMsg] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);

  // Axios helper with token authentication and auto-logout on 401
  const api = useMemo(() => {
    const cleanBase = (baseUrl || defaultApiUrl).replace(/\/+$/, "");
    const instance = axios.create({
      baseURL: cleanBase,
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("admin_token");
          setToken("");
          setIsLoggedIn(false);
          setAuthError("Session expired or unauthorized. Please log in again.");
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [baseUrl, token]);

  const showToast = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  // Auth handler: authenticates against backend /api/v2/admin/login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError("");
    try {
      const cleanBase = (baseUrl || defaultApiUrl).replace(/\/+$/, "");
      const res = await axios.post(`${cleanBase}/admin/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const authToken = res.data?.data?.accessToken;
      if (!authToken) {
        throw new Error(res.data?.message || "Failed to obtain admin access token");
      }

      localStorage.setItem("admin_token", authToken);
      localStorage.setItem("admin_base_url", cleanBase);
      setToken(authToken);
      setIsLoggedIn(true);
      showToast("Admin authenticated successfully! 🚀");
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Login failed. Check your API URL and credentials.";
      setAuthError(errMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLoggedIn(false);
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "dashboard") {
        const res = await api.get("/admin/dashboard-stats");
        if (res.data?.success) setStats(res.data.data);
      } else if (activeTab === "personas") {
        const res = await api.get(`/admin/personas?search=${personaSearch}`);
        if (res.data?.success) setPersonas(res.data.data.personas || []);
      } else if (activeTab === "users") {
        const res = await api.get(
          `/admin/users?page=${userPage}&search=${userSearch}&tier=${userTierFilter}`
        );
        if (res.data?.success) {
          setUsers(res.data.data.users || []);
          setUserTotalPages(res.data.data.totalPages || 1);
        }
      } else if (activeTab === "subscriptions") {
        const res = await api.get(`/admin/subscriptions?page=${subPage}`);
        if (res.data?.success) {
          setSubscriptionsList(res.data.data.subscriptions || []);
          setSubTotalPages(res.data.data.totalPages || 1);
        }
      } else if (activeTab === "moderation") {
        const [repRes, helpRes] = await Promise.all([
          api.get("/admin/reports"),
          api.get("/admin/help-requests"),
        ]);
        if (repRes.data?.success) setReports(repRes.data.data.reports || []);
        if (helpRes.data?.success) setHelpRequests(helpRes.data.data.requests || []);
      }

      // Always fetch latest system config
      const cfgRes = await api.get("/admin/system-config");
      if (cfgRes.data?.success) {
        setSysConfig((prev) => ({ ...prev, ...cfgRes.data.data }));
      }
    } catch (err) {
      console.warn("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, activeTab, userPage, subPage, personaSearch]);

  // Persona Save / Update
  const handleSavePersona = async (e) => {
    e.preventDefault();
    try {
      const photosArray = Array.isArray(personaForm.photos) && personaForm.photos.length > 0
        ? personaForm.photos
        : (personaForm.avatarUrl ? [personaForm.avatarUrl] : []);
      const primaryAvatar = personaForm.avatarUrl || photosArray[0] || "";

      const payload = {
        ...personaForm,
        avatarUrl: primaryAvatar,
        photos: photosArray,
        supportedLanguages: Array.isArray(personaForm.language)
          ? personaForm.language
          : [personaForm.language || "en"],
        language: Array.isArray(personaForm.language)
          ? personaForm.language
          : [personaForm.language || "en"],
      };
      if (editingPersona) {
        await api.put(`/admin/personas/${editingPersona._id}`, payload);
        showToast("AI Persona updated successfully! ✨");
      } else {
        await api.post("/admin/personas", payload);
        showToast("New AI Persona created! 🚀");
      }
      setIsPersonaModalOpen(false);
      setEditingPersona(null);
      fetchData();
    } catch (err) {
      showToast("Failed to save persona: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDeletePersona = async (id) => {
    if (!window.confirm("Are you sure you want to delete this AI Persona?")) return;
    try {
      await api.delete(`/admin/personas/${id}`);
      showToast("Persona deleted");
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  const openPersonaModal = (persona = null) => {
    setNewPhotoUrl("");
    if (persona) {
      setEditingPersona(persona);
      const personaPhotos = Array.isArray(persona.photos) && persona.photos.length > 0
        ? persona.photos
        : (persona.avatarUrl ? [persona.avatarUrl] : []);
      setPersonaForm({
        name: persona.name || "",
        bio: persona.bio || "",
        gender: persona.gender || "female",
        avatarUrl: persona.avatarUrl || (personaPhotos[0] || ""),
        photos: personaPhotos,
        relationshipDynamic: persona.relationshipDynamic || "romantic-partner",
        personalityTraits: persona.personalityTraits || [],
        interests: persona.interests || [],
        voiceStyle: persona.voiceStyle || "sweet",
        accentColor: persona.accentColor || "#FF4B72",
        language: persona.language || ["en"],
        isPremium: !!persona.isPremium,
        isActive: persona.isActive !== false,
        livekitEnabled: persona.livekitEnabled !== false,
        openrouterModel: persona.openrouterModel || "meta-llama/llama-3.3-70b-instruct",
        temperature: persona.temperature || 0.85,
        maxTokens: persona.maxTokens || 400,
        systemPromptTemplate: persona.systemPromptTemplate || "",
      });
    } else {
      setEditingPersona(null);
      const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80";
      setPersonaForm({
        name: "",
        bio: "",
        gender: "female",
        avatarUrl: defaultAvatar,
        photos: [defaultAvatar],
        relationshipDynamic: "romantic-partner",
        personalityTraits: ["sweet", "playful", "romantic"],
        interests: ["travel", "music"],
        voiceStyle: "sweet",
        accentColor: "#FF4B72",
        language: ["en", "hi"],
        isPremium: false,
        isActive: true,
        livekitEnabled: true,
        openrouterModel: "meta-llama/llama-3.3-70b-instruct",
        temperature: 0.85,
        maxTokens: 400,
        systemPromptTemplate: "",
      });
    }
    setIsPersonaModalOpen(true);
  };

  // System Config & Theme Save
  const handleSaveConfig = async () => {
    try {
      await api.post("/admin/system-config", sysConfig);
      showToast("Configuration saved and published live! 💎");
    } catch (err) {
      showToast("Failed to save configuration: " + err.message);
    }
  };

  // Broadcast Notification
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    try {
      await api.post("/admin/notifications/send", {
        title: broadcastTitle,
        message: broadcastMessage,
        targetTier: broadcastTargetTier,
      });
      showToast("Push notification dispatched to users! 📢");
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (err) {
      showToast("Error sending notification: " + err.message);
    }
  };

  // Toggle user block
  const handleToggleBlock = async (id) => {
    try {
      await api.post(`/admin/users/${id}/toggle-block`);
      showToast("User status updated");
      fetchData();
    } catch (err) {
      showToast("Error: " + err.message);
    }
  };

  // Reply to ticket
  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyTicketId || !replyText) return;
    try {
      await api.post(`/admin/help-requests/${replyTicketId}/reply`, {
        adminResponse: replyText,
      });
      showToast("Support ticket resolved!");
      setReplyTicketId(null);
      setReplyText("");
      fetchData();
    } catch (err) {
      showToast("Error resolving ticket: " + err.message);
    }
  };

  // Mock analytics data for charts
  const activityData = [
    { name: "Mon", messages: 2400, calls: 400, activeUsers: 1200 },
    { name: "Tue", messages: 3210, calls: 520, activeUsers: 1450 },
    { name: "Wed", messages: 2980, calls: 610, activeUsers: 1620 },
    { name: "Thu", messages: 4120, calls: 730, activeUsers: 1980 },
    { name: "Fri", messages: 5400, calls: 940, activeUsers: 2400 },
    { name: "Sat", messages: 7200, calls: 1350, activeUsers: 3100 },
    { name: "Sun", messages: 6850, calls: 1280, activeUsers: 2950 },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0814] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#161329] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI Dating
              </h1>
              <p className="text-xs text-white/50">Admin Command Center</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Backend API URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500"
                placeholder="http://localhost:3000/api/v2"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500"
                placeholder="admin@aidating.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-500"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold shadow-lg shadow-pink-500/25 hover:opacity-90 transition disabled:opacity-50 mt-2"
            >
              {isAuthLoading ? "Authenticating..." : "Access Control Center"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0814] text-white flex">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20 animate-bounce">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#120F24] border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-pink-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI Dating
              </h2>
              <p className="text-[11px] text-white/40 tracking-wider uppercase font-semibold">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "personas", label: "AI Personas", icon: Bot },
            { id: "subscriptions", label: "Subscriptions & Limits", icon: CreditCard },
            { id: "theme", label: "Remote Theme Studio", icon: Palette },
            { id: "flags", label: "Feature Flags", icon: Sliders },
            { id: "users", label: "User Directory", icon: Users },
            { id: "broadcast", label: "Push Broadcast", icon: Bell },
            { id: "moderation", label: "Moderation & Tickets", icon: Shield },
            { id: "settings", label: "LLM & Voice APIs", icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border border-pink-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-pink-400" : "text-white/40"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/60 rounded-xl text-xs font-semibold transition border border-white/5"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-8 bg-[#0E0C1C]/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base md:text-lg font-bold capitalize truncate">
              {activeTab === "theme"
                ? "Remote Dynamic Theme Studio"
                : activeTab === "personas"
                ? "AI Companion Personas Manager"
                : activeTab === "flags"
                ? "Dynamic Feature Flags & Switches"
                : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 transition flex items-center gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-1">
          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Users", val: stats.totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
                  { label: "Active Subscribers", val: stats.activeSubscribers, icon: CreditCard, color: "from-emerald-500 to-teal-500" },
                  { label: "AI Personas", val: stats.totalPersonas || personas.length, icon: Bot, color: "from-pink-500 to-rose-500" },
                  { label: "Total Chat Sessions", val: stats.totalSessions, icon: MessageSquare, color: "from-purple-500 to-indigo-500" },
                  { label: "Voice & Call Sessions", val: stats.totalCalls, icon: PhoneCall, color: "from-amber-500 to-orange-500" },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-[#161329] border border-white/5 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-white/50 font-medium">{s.label}</p>
                          <p className="text-2xl font-bold mt-1">{s.val}</p>
                        </div>
                        <div className={`p-3 bg-gradient-to-tr ${s.color} rounded-xl shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base">Weekly Activity & AI Engagement</h3>
                    <p className="text-xs text-white/40">Tokens, conversations, and minutes streamed</p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4B72" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FF4B72" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="name" stroke="#ffffff40" />
                      <YAxis stroke="#ffffff40" />
                      <Tooltip contentStyle={{ backgroundColor: "#120F24", borderColor: "#ffffff20", borderRadius: 12 }} />
                      <Area type="monotone" dataKey="messages" stroke="#FF4B72" fillOpacity={1} fill="url(#colorMsgs)" name="Chat Messages" />
                      <Area type="monotone" dataKey="calls" stroke="#7C4DFF" fillOpacity={1} fill="url(#colorCalls)" name="Voice Calls" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI PERSONAS */}
          {activeTab === "personas" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search personas..."
                      value={personaSearch}
                      onChange={(e) => setPersonaSearch(e.target.value)}
                      className="w-full bg-[#161329] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => openPersonaModal()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 hover:opacity-90 transition"
                >
                  <Plus className="w-4 h-4" /> Create New AI Persona
                </button>
              </div>

              {/* Persona Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {personas.map((p) => (
                  <div
                    key={p._id}
                    className="bg-[#161329] border border-white/5 rounded-2xl p-5 hover:border-pink-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-4">
                        <img
                          src={p.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"}
                          alt={p.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2"
                          style={{ borderColor: p.accentColor || "#FF4B72" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base truncate">{p.name}</h3>
                            {p.isPremium && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                                PRO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 capitalize">
                            {p.gender} • {p.photos?.length || 1} {(p.photos?.length || 1) === 1 ? "photo" : "photos"} • Voice: {p.voiceStyle}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(p.language || []).map((l) => (
                              <span
                                key={l}
                                className="text-[10px] uppercase bg-white/5 text-white/60 px-1.5 py-0.5 rounded border border-white/5"
                              >
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-white/70 mt-4 line-clamp-2">{p.bio}</p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {(p.personalityTraits || []).map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded-full"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                      <span className="text-[11px] text-white/40">Model: {p.openrouterModel?.split("/")[1] || "default"}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPersonaModal(p)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePersona(p._id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIPTIONS & LIMITS */}
          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Tier */}
                <div className="bg-[#161329] border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-gray-300">Free Tier Limits</h3>
                    <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/60">Default</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Free Text Messages</label>
                      <input
                        type="number"
                        value={sysConfig.freeTextLimit}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, freeTextLimit: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Free Voice Messages</label>
                      <input
                        type="number"
                        value={sysConfig.freeVoiceLimit}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, freeVoiceLimit: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Free Live Call Minutes</label>
                      <input
                        type="number"
                        value={sysConfig.freeCallMinutes}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, freeCallMinutes: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Basic Tier */}
                <div className="bg-[#161329] border border-blue-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-blue-400">Basic Tier Limits</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full">Standard</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Text Messages</label>
                      <input
                        type="number"
                        value={sysConfig.basicTextLimit}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, basicTextLimit: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Voice Messages</label>
                      <input
                        type="number"
                        value={sysConfig.basicVoiceLimit}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, basicVoiceLimit: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Live Call Minutes</label>
                      <input
                        type="number"
                        value={sysConfig.basicCallMinutes}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, basicCallMinutes: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Premium Tier */}
                <div className="bg-[#161329] border border-pink-500/20 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-base text-pink-400">Premium Tier Limits</h3>
                    <span className="text-xs bg-pink-500/20 text-pink-300 px-2.5 py-1 rounded-full">VIP / Unlimited</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Text Messages (-1 for unlimited)</label>
                      <input
                        type="number"
                        value={sysConfig.premiumTextLimit}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, premiumTextLimit: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Voice Messages (-1 for unlimited)</label>
                      <input
                        type="number"
                        value={sysConfig.premiumVoiceLimit}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, premiumVoiceLimit: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/60 mb-1">Daily Live Call Minutes</label>
                      <input
                        type="number"
                        value={sysConfig.premiumCallMinutes}
                        onChange={(e) =>
                          setSysConfig({ ...sysConfig, premiumCallMinutes: Number(e.target.value) })
                        }
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-90 transition"
                >
                  <Save className="w-4 h-4" /> Save & Deploy Tier Limits
                </button>
              </div>

              {/* Subscriptions Table */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 mt-6">
                <h3 className="font-bold text-base mb-4">In-App Purchase Subscribers Audit</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 pb-2">
                        <th className="py-3">User</th>
                        <th>Tier</th>
                        <th>Platform</th>
                        <th>Product ID</th>
                        <th>Expires At</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {subscriptionsList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-white/40">
                            No subscription records found yet
                          </td>
                        </tr>
                      ) : (
                        subscriptionsList.map((s) => (
                          <tr key={s._id} className="hover:bg-white/5">
                            <td className="py-3 font-semibold">{s.userId?.name || s.userId?.email || "User"}</td>
                            <td>
                              <span className="uppercase font-bold text-pink-400">{s.tier}</span>
                            </td>
                            <td className="uppercase">{s.platform}</td>
                            <td className="text-white/60">{s.productId}</td>
                            <td>{new Date(s.expiresAt).toLocaleDateString()}</td>
                            <td>
                              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full text-[10px]">
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REMOTE THEME STUDIO */}
          {activeTab === "theme" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Palette Controls */}
              <div className="lg:col-span-7 bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-base">Dynamic Theme Tokens</h3>
                  <p className="text-xs text-white/50">
                    Changes here update the Flutter app appearance dynamically via remote config without needing an App Store update.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "primaryColor", label: "Primary Brand Color" },
                    { key: "secondaryColor", label: "Secondary Color" },
                    { key: "accentColor", label: "Accent Color" },
                    { key: "backgroundColorDark", label: "Background Dark" },
                    { key: "surfaceColorDark", label: "Card Surface Dark" },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-xs text-white/70 mb-1">{item.label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={sysConfig.remoteThemeConfig?.[item.key] || "#FF4B72"}
                          onChange={(e) =>
                            setSysConfig({
                              ...sysConfig,
                              remoteThemeConfig: {
                                ...sysConfig.remoteThemeConfig,
                                [item.key]: e.target.value,
                              },
                            })
                          }
                          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={sysConfig.remoteThemeConfig?.[item.key] || "#FF4B72"}
                          onChange={(e) =>
                            setSysConfig({
                              ...sysConfig,
                              remoteThemeConfig: {
                                ...sysConfig.remoteThemeConfig,
                                [item.key]: e.target.value,
                              },
                            })
                          }
                          className="flex-1 bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500 uppercase"
                        />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Typography Font Family</label>
                    <select
                      value={sysConfig.remoteThemeConfig?.fontFamily || "Outfit"}
                      onChange={(e) =>
                        setSysConfig({
                          ...sysConfig,
                          remoteThemeConfig: {
                            ...sysConfig.remoteThemeConfig,
                            fontFamily: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                    >
                      <option value="Outfit">Outfit</option>
                      <option value="Inter">Inter</option>
                      <option value="Poppins">Poppins</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleSaveConfig}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-90 transition"
                  >
                    <Save className="w-4 h-4" /> Publish Theme Over-The-Air
                  </button>
                </div>
              </div>

              {/* Live Mobile Device Frame Mockup Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div
                  className="w-72 h-[560px] rounded-[38px] border-4 border-white/15 p-3 shadow-2xl relative flex flex-col justify-between overflow-hidden"
                  style={{
                    backgroundColor: sysConfig.remoteThemeConfig?.backgroundColorDark || "#0A0814",
                    fontFamily: sysConfig.remoteThemeConfig?.fontFamily || "sans-serif",
                  }}
                >
                  {/* Speaker Notch */}
                  <div className="w-24 h-4 bg-black/60 rounded-full mx-auto mb-2 shrink-0" />

                  {/* Mock App Header */}
                  <div className="px-3 flex items-center justify-between mb-3">
                    <span className="font-bold text-sm" style={{ color: sysConfig.remoteThemeConfig?.primaryColor }}>
                      AI Dating
                    </span>
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    </div>
                  </div>

                  {/* Mock Persona Card */}
                  <div
                    className="p-3.5 rounded-2xl border border-white/10 mb-auto"
                    style={{ backgroundColor: sysConfig.remoteThemeConfig?.surfaceColorDark || "#161329" }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                      alt="Mock"
                      className="w-full h-32 rounded-xl object-cover mb-2"
                    />
                    <h4 className="font-bold text-xs text-white">Sophia, 23</h4>
                    <p className="text-[10px] text-white/50">Your caring AI soulmate</p>
                    <button
                      className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-white shadow-md"
                      style={{
                        backgroundColor: sysConfig.remoteThemeConfig?.primaryColor || "#FF4B72",
                      }}
                    >
                      Start Conversation
                    </button>
                  </div>

                  {/* Mock Chat Bubble */}
                  <div
                    className="p-2.5 rounded-xl border border-white/10 text-[10px] text-white/80 mt-2"
                    style={{ backgroundColor: sysConfig.remoteThemeConfig?.surfaceColorDark }}
                  >
                    <span className="font-bold block text-[10px] mb-0.5 text-pink-400">Sophia:</span>
                    "Thinking of you! Have you had lunch yet? 🥰"
                  </div>

                  {/* Home Bar Indicator */}
                  <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-3" />
                </div>
              </div>
            </div>
          )}

          {/* TAB: FEATURE FLAGS */}
          {activeTab === "flags" && (
            <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 max-w-2xl space-y-6">
              <div>
                <h3 className="font-bold text-base">Feature Toggles & Remote Flags</h3>
                <p className="text-xs text-white/50">Instantly enable or disable core features in production</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: "liveCallsEnabled", label: "LiveKit AI Voice Calls", desc: "Allows users to make real-time audio calls with companions" },
                  { key: "voiceChatEnabled", label: "Voice Message Input", desc: "Allows speech-to-text dictation and audio messages" },
                  { key: "aiTranscriptCorrectionEnabled", label: "AI Speech-to-Text Post-Correction", desc: "Performs LLM grammar correction on user dictation" },
                  { key: "inAppPurchasesEnabled", label: "In-App Purchases & Subscriptions", desc: "Enables paywall sheets and store purchasing flows" },
                  { key: "discoveryProfilesEnabled", label: "Companion Discovery Feed", desc: "Displays persona catalog and profile filters" },
                  { key: "customPersonaCreationEnabled", label: "Custom Partner Customization", desc: "Allows users to customize companion name and dynamic" },
                ].map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center justify-between p-4 bg-[#0E0C1C] border border-white/5 rounded-xl"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-white">{f.label}</h4>
                      <p className="text-[11px] text-white/40 mt-0.5">{f.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!sysConfig.featureFlags?.[f.key]}
                        onChange={(e) =>
                          setSysConfig({
                            ...sysConfig,
                            featureFlags: {
                              ...sysConfig.featureFlags,
                              [f.key]: e.target.checked,
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-90 transition"
                >
                  <Save className="w-4 h-4" /> Save Feature Flags
                </button>
              </div>
            </div>
          )}

          {/* TAB: USER DIRECTORY */}
          {activeTab === "users" && (
            <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={userTierFilter}
                    onChange={(e) => setUserTierFilter(e.target.value)}
                    className="bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2 text-xs focus:outline-none"
                  >
                    <option value="">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 pb-2">
                      <th className="py-3">User</th>
                      <th>Gender</th>
                      <th>Preferred Language</th>
                      <th>Subscription</th>
                      <th>Onboarded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5">
                        <td className="py-3">
                          <div>
                            <p className="font-semibold">{u.name || "Anonymous User"}</p>
                            <p className="text-[11px] text-white/40">{u.email}</p>
                          </div>
                        </td>
                        <td className="capitalize">{u.gender || "Unspecified"}</td>
                        <td className="uppercase">{u.preferredLanguage || "en"}</td>
                        <td>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.subscriptionTier === "premium"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : u.subscriptionTier === "basic"
                                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                : "bg-white/5 text-white/50"
                            }`}
                          >
                            {u.subscriptionTier || "free"}
                          </span>
                        </td>
                        <td>{u.onboardingComplete ? "✅ Yes" : "⏳ Pending"}</td>
                        <td>
                          <button
                            onClick={() => handleToggleBlock(u._id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                              u.isBlocked
                                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                : "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            }`}
                          >
                            {u.isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PUSH BROADCAST */}
          {activeTab === "broadcast" && (
            <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 max-w-xl space-y-4">
              <div>
                <h3 className="font-bold text-base">Broadcast Push Notification</h3>
                <p className="text-xs text-white/50">Dispatches real-time alerts to user devices via Firebase Cloud Messaging</p>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Target Segment</label>
                  <select
                    value={broadcastTargetTier}
                    onChange={(e) => setBroadcastTargetTier(e.target.value)}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  >
                    <option value="all">All Registered Users</option>
                    <option value="free">Free Tier Only</option>
                    <option value="basic">Basic Subscribers Only</option>
                    <option value="premium">Premium VIPs Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Notification Title</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Sophia sent you a voice note 💌"
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">Message Content</label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="I was just wondering what you were doing right now... tap to listen!"
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-90 transition"
                >
                  <Bell className="w-4 h-4" /> Send Broadcast Now
                </button>
              </form>
            </div>
          )}

          {/* TAB: MODERATION & TICKETS */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-base mb-4">Support & Help Tickets</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 pb-2">
                        <th className="py-3">User</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {helpRequests.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-white/40">
                            No tickets open
                          </td>
                        </tr>
                      ) : (
                        helpRequests.map((t) => (
                          <tr key={t._id}>
                            <td className="py-3 font-semibold">{t.userId?.name || t.userId?.email || "User"}</td>
                            <td>{t.subject}</td>
                            <td className="text-white/60 max-w-xs truncate">{t.message}</td>
                            <td>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  t.status === "resolved" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td>
                              {t.status !== "resolved" && (
                                <button
                                  onClick={() => setReplyTicketId(t._id)}
                                  className="px-2 py-1 bg-pink-500/20 text-pink-300 rounded text-[11px]"
                                >
                                  Reply
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & LLM APIS */}
          {activeTab === "settings" && (
            <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 max-w-2xl space-y-6">
              <div>
                <h3 className="font-bold text-base">AI Engine & LiveKit Credentials</h3>
                <p className="text-xs text-white/50">Configure OpenRouter LLM orchestration and LiveKit cloud servers</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">OpenRouter API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={sysConfig.openRouterApiKey || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, openRouterApiKey: e.target.value })}
                      placeholder="sk-or-v1-..."
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Default OpenRouter Primary Model</label>
                  <input
                    type="text"
                    value={sysConfig.openRouterModel || "meta-llama/llama-3.3-70b-instruct"}
                    onChange={(e) => setSysConfig({ ...sysConfig, openRouterModel: e.target.value })}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">LiveKit WebSocket URL</label>
                  <input
                    type="text"
                    value={sysConfig.livekitUrl || ""}
                    onChange={(e) => setSysConfig({ ...sysConfig, livekitUrl: e.target.value })}
                    placeholder="wss://your-project.livekit.cloud"
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">LiveKit API Key</label>
                  <input
                    type="text"
                    value={sysConfig.livekitApiKey || ""}
                    onChange={(e) => setSysConfig({ ...sysConfig, livekitApiKey: e.target.value })}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">LiveKit API Secret</label>
                  <input
                    type="password"
                    value={sysConfig.livekitApiSecret || ""}
                    onChange={(e) => setSysConfig({ ...sysConfig, livekitApiSecret: e.target.value })}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-90 transition"
                >
                  <Save className="w-4 h-4" /> Save System Credentials
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE / EDIT PERSONA MODAL */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161329] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="font-bold text-lg">
                {editingPersona ? `Edit Persona: ${editingPersona.name}` : "Create New AI Persona"}
              </h3>
              <button onClick={() => setIsPersonaModalOpen(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersona} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Persona Name</label>
                  <input
                    type="text"
                    value={personaForm.name}
                    onChange={(e) => setPersonaForm({ ...personaForm, name: e.target.value })}
                    placeholder="Sophia, Maya, Alex..."
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Gender</label>
                  <select
                    value={personaForm.gender}
                    onChange={(e) => setPersonaForm({ ...personaForm, gender: e.target.value })}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Dynamic</label>
                  <select
                    value={personaForm.relationshipDynamic || "romantic-partner"}
                    onChange={(e) => setPersonaForm({ ...personaForm, relationshipDynamic: e.target.value })}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  >
                    <option value="romantic-partner">Romantic Partner</option>
                    <option value="playful-flirt">Playful Flirt</option>
                    <option value="intellectual-peer">Intellectual Peer</option>
                    <option value="caring-listener">Caring Listener</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Primary Cover / Avatar URL</label>
                <input
                  type="text"
                  value={personaForm.avatarUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setPersonaForm((prev) => ({
                      ...prev,
                      avatarUrl: url,
                      photos: prev.photos.includes(url) ? prev.photos : (url ? [url, ...prev.photos] : prev.photos),
                    }));
                  }}
                  placeholder="https://..."
                  className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Agent Multi-Photo Gallery for Profile */}
              <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white/90">Agent Profile Gallery</span>
                    <span className="text-[11px] text-pink-400 ml-2">({personaForm.photos?.length || 0} photos)</span>
                  </div>
                  <span className="text-[10px] text-white/40">Users can swipe through these photos in Discovery & Profile</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Enter additional photo URL..."
                    className="flex-1 bg-[#161329] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPhotoUrl.trim()) return;
                      const trimmed = newPhotoUrl.trim();
                      if (!personaForm.photos.includes(trimmed)) {
                        setPersonaForm((prev) => ({
                          ...prev,
                          photos: [...prev.photos, trimmed],
                          avatarUrl: prev.avatarUrl || trimmed,
                        }));
                      }
                      setNewPhotoUrl("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 text-xs font-medium hover:bg-pink-500/30 transition-colors"
                  >
                    + Add Photo
                  </button>
                </div>

                {personaForm.photos && personaForm.photos.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1 max-h-36 overflow-y-auto">
                    {personaForm.photos.map((photo, pIdx) => {
                      const isCover = personaForm.avatarUrl === photo;
                      return (
                        <div key={pIdx} className="relative group rounded-lg overflow-hidden border border-white/10 aspect-square bg-black/40">
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                          {isCover && (
                            <span className="absolute top-1 left-1 bg-pink-500 text-[8px] px-1 py-0.5 rounded font-bold text-white shadow">
                              Cover
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => setPersonaForm({ ...personaForm, avatarUrl: photo })}
                                className="text-[9px] bg-white/20 hover:bg-white/40 text-white px-1.5 py-0.5 rounded w-full text-center"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const nextPhotos = personaForm.photos.filter((_, i) => i !== pIdx);
                                const nextAvatar = isCover ? (nextPhotos[0] || "") : personaForm.avatarUrl;
                                setPersonaForm({ ...personaForm, photos: nextPhotos, avatarUrl: nextAvatar });
                              }}
                              className="text-[9px] bg-red-500/80 hover:bg-red-600 text-white px-1.5 py-0.5 rounded w-full text-center"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-white/40 italic">No photos added yet. Add photos above so users can explore the agent's full profile.</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Bio / Companion Story</label>
                <textarea
                  rows={2}
                  value={personaForm.bio}
                  onChange={(e) => setPersonaForm({ ...personaForm, bio: e.target.value })}
                  placeholder="Warm, thoughtful poet who loves quiet coffee mornings..."
                  className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/70 mb-1">Voice Style</label>
                  <select
                    value={personaForm.voiceStyle}
                    onChange={(e) => setPersonaForm({ ...personaForm, voiceStyle: e.target.value })}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                  >
                    <option value="sweet">Sweet & Gentle</option>
                    <option value="playful">Playful & Witty</option>
                    <option value="deep">Deep & Calming</option>
                    <option value="confident">Confident & Sassy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">Accent Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={personaForm.accentColor}
                      onChange={(e) => setPersonaForm({ ...personaForm, accentColor: e.target.value })}
                      className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={personaForm.accentColor}
                      onChange={(e) => setPersonaForm({ ...personaForm, accentColor: e.target.value })}
                      className="flex-1 bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">Personality Traits</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {personaForm.personalityTraits.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-pink-500/20 text-pink-300 rounded-lg text-xs flex items-center gap-1"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setPersonaForm({
                            ...personaForm,
                            personalityTraits: personaForm.personalityTraits.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    placeholder="Add trait (e.g. affectionate)"
                    className="flex-1 bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTrait.trim()) {
                        setPersonaForm({
                          ...personaForm,
                          personalityTraits: [...personaForm.personalityTraits, newTrait.trim()],
                        });
                        setNewTrait("");
                      }
                    }}
                    className="px-3 py-2 bg-white/10 rounded-xl text-xs hover:bg-white/20"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={personaForm.isPremium}
                    onChange={(e) => setPersonaForm({ ...personaForm, isPremium: e.target.checked })}
                    className="rounded bg-white/10 text-pink-500"
                  />
                  <span>PRO / Subscriber Only Persona</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={personaForm.livekitEnabled}
                    onChange={(e) => setPersonaForm({ ...personaForm, livekitEnabled: e.target.checked })}
                    className="rounded bg-white/10 text-pink-500"
                  />
                  <span>LiveKit Calling Enabled</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-white/70 mb-1">
                  Custom System Prompt Template (Supports &#123;&#123;name&#125;&#125;, &#123;&#123;userName&#125;&#125;, &#123;&#123;traits&#125;&#125;, etc.)
                </label>
                <textarea
                  rows={4}
                  value={personaForm.systemPromptTemplate}
                  onChange={(e) => setPersonaForm({ ...personaForm, systemPromptTemplate: e.target.value })}
                  placeholder="Leave empty to use intelligent default romantic system prompt..."
                  className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPersonaModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold shadow-lg shadow-pink-500/25"
                >
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET REPLY MODAL */}
      {replyTicketId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161329] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-base mb-3">Reply to Support Ticket</h3>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Your answer to the user's issue..."
              className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-pink-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setReplyTicketId(null)}
                className="px-4 py-2 bg-white/5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReplyTicket}
                className="px-5 py-2 bg-pink-500 rounded-xl text-xs font-semibold"
              >
                Send Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
