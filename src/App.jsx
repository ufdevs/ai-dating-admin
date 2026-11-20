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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowLeft,
  ExternalLink,
  Send,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
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

  // Dashboard Stats state (DAU, WAU, MAU, Retention)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalPersonas: 0,
    totalSessions: 0,
    totalCalls: 0,
    dau: 0,
    wau: 0,
    mau: 0,
    stickinessRatio: 0,
    newUsersToday: 0,
    activeSessionsToday: 0,
    tierBreakdown: [],
    activityTrend: [],
  });

  // Personas state
  const [personas, setPersonas] = useState([]);
  const [personaSearch, setPersonaSearch] = useState("");
  const [personaGenderFilter, setPersonaGenderFilter] = useState("all");
  const [personaPage, setPersonaPage] = useState(1);
  const [personaTotalPages, setPersonaTotalPages] = useState(1);
  const [personaTotal, setPersonaTotal] = useState(0);
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
    admobEnabled: true,
    admobAppIdAndroid: "ca-app-pub-3940256099942544~3347511713",
    admobAppIdIos: "ca-app-pub-3940256099942544~1458002511",
    admobBannerAdUnitId: "ca-app-pub-3940256099942544/6300978111",
    admobInterstitialAdUnitId: "ca-app-pub-3940256099942544/1033173712",
    admobRewardedAdUnitId: "ca-app-pub-3940256099942544/5224354917",
    admobRewardedInterstitialAdUnitId: "ca-app-pub-3940256099942544/5354046379",
    rewardedChatCredits: 5,
    rewardedCallMinutes: 2,
    rewardedInterstitialChatCredits: 3,
    rewardedInterstitialCallMinutes: 1,
    posthogEnabled: true,
    posthogApiKey: "phc_CyBcBtqEBLik3rZqUukoUnGAgpQzd7dtqvkABi2EMTrA",
    posthogHost: "https://eu.i.posthog.com",
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
  const [userActivityFilter, setUserActivityFilter] = useState(""); // dau, wau, mau, inactive
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null); // Single user deletion modal
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false); // Bulk wipe modal
  const [deleteAllConfirmText, setDeleteAllConfirmText] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Vercel Cron & Auto-Trigger status
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [cronJobStatus, setCronJobStatus] = useState(null);

  // AI Conversations & Transcripts state
  const [conversations, setConversations] = useState([]);
  const [convSearch, setConvSearch] = useState("");
  const [convPersonaFilter, setConvPersonaFilter] = useState("");
  const [convUserFilter, setConvUserFilter] = useState("");
  const [convUserName, setConvUserName] = useState("");
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);
  const [convTotal, setConvTotal] = useState(0);
  const [activeSession, setActiveSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // Subscriptions list
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotal, setSubTotal] = useState(0);

  // Moderation & Support
  const [reports, setReports] = useState([]);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsTotal, setReportsTotal] = useState(0);

  const [helpRequests, setHelpRequests] = useState([]);
  const [helpPage, setHelpPage] = useState(1);
  const [helpTotalPages, setHelpTotalPages] = useState(1);
  const [helpTotal, setHelpTotal] = useState(0);

  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Push broadcast & Notification Management
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastImageUrl, setBroadcastImageUrl] = useState("");
  const [broadcastTargetType, setBroadcastTargetType] = useState("all");
  const [broadcastTargetFilter, setBroadcastTargetFilter] = useState("");
  const [broadcastTargetTier, setBroadcastTargetTier] = useState("all");
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [notificationLogs, setNotificationLogs] = useState([]);
  const [notifPage, setNotifPage] = useState(1);
  const [notifTotalPages, setNotifTotalPages] = useState(1);
  const [notifTotal, setNotifTotal] = useState(0);

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [recipientsList, setRecipientsList] = useState([]);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientTotalPages, setRecipientTotalPages] = useState(1);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientStatusFilter, setRecipientStatusFilter] = useState("all");
  const [recipientsLoading, setRecipientsLoading] = useState(false);

  // Ad Tracking Analytics & Failure Logs
  const [adAnalytics, setAdAnalytics] = useState(null);
  const [adLogsList, setAdLogsList] = useState([]);
  const [adLogsPage, setAdLogsPage] = useState(1);
  const [adLogsTotalPages, setAdLogsTotalPages] = useState(1);
  const [adLogsTotal, setAdLogsTotal] = useState(0);
  const [adLogsEventFilter, setAdLogsEventFilter] = useState("all");
  const [adLogsProviderFilter, setAdLogsProviderFilter] = useState("all");
  const [adLogsTypeFilter, setAdLogsTypeFilter] = useState("all");
  const [adLogsErrorCodeFilter, setAdLogsErrorCodeFilter] = useState("all");
  const [adLogsSearch, setAdLogsSearch] = useState("");
  const [adDiagnostics, setAdDiagnostics] = useState(null);
  const [selectedAdLog, setSelectedAdLog] = useState(null);
  const [isAdLogModalOpen, setIsAdLogModalOpen] = useState(false);
  const [isAdLogsLoading, setIsAdLogsLoading] = useState(false);

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
        const [dashRes, cronRes] = await Promise.all([
          api.get("/admin/dashboard-stats"),
          api.get("/admin/cron/job-status").catch(() => null),
        ]);
        if (dashRes.data?.success) setStats(dashRes.data.data);
        if (cronRes?.data?.success) setCronJobStatus(cronRes.data.data);
      } else if (activeTab === "personas") {
        const res = await api.get(`/admin/personas?page=${personaPage}&limit=12&search=${personaSearch}`);
        if (res.data?.success) {
          setPersonas(res.data.data.personas || []);
          setPersonaTotalPages(res.data.data.totalPages || 1);
          setPersonaTotal(res.data.data.total || 0);
        }
      } else if (activeTab === "users") {
        const res = await api.get(
          `/admin/users?page=${userPage}&limit=15&search=${userSearch}&tier=${userTierFilter}&activityStatus=${userActivityFilter}`
        );
        if (res.data?.success) {
          setUsers(res.data.data.users || []);
          setUserTotalPages(res.data.data.totalPages || 1);
        }
      } else if (activeTab === "conversations") {
        const queryParams = new URLSearchParams({
          page: convPage,
          limit: 15,
          search: convSearch,
          personaId: convPersonaFilter,
          userId: convUserFilter,
        }).toString();
        const [convRes, personaRes] = await Promise.all([
          api.get(`/admin/conversations?${queryParams}`),
          personas.length === 0 ? api.get("/admin/personas?limit=100") : Promise.resolve(null),
        ]);
        if (convRes.data?.success) {
          setConversations(convRes.data.data.sessions || []);
          setConvTotalPages(convRes.data.data.totalPages || 1);
          setConvTotal(convRes.data.data.total || 0);
        }
        if (personaRes?.data?.success) {
          setPersonas(personaRes.data.data.personas || []);
        }
      } else if (activeTab === "subscriptions") {
        const res = await api.get(`/admin/subscriptions?page=${subPage}&limit=15`);
        if (res.data?.success) {
          setSubscriptionsList(res.data.data.subscriptions || []);
          setSubTotalPages(res.data.data.totalPages || 1);
          setSubTotal(res.data.data.total || 0);
        }
      } else if (activeTab === "moderation") {
        const [repRes, helpRes] = await Promise.all([
          api.get(`/admin/reports?page=${reportsPage}&limit=15`),
          api.get(`/admin/help-requests?page=${helpPage}&limit=15`),
        ]);
        if (repRes.data?.success) {
          setReports(repRes.data.data.reports || []);
          setReportsTotalPages(repRes.data.data.totalPages || 1);
          setReportsTotal(repRes.data.data.total || 0);
        }
        if (helpRes.data?.success) {
          setHelpRequests(helpRes.data.data.requests || []);
          setHelpTotalPages(helpRes.data.data.totalPages || 1);
          setHelpTotal(helpRes.data.data.total || 0);
        }
      } else if (activeTab === "broadcast") {
        const notifRes = await api.get(`/admin/notifications?page=${notifPage}&limit=15`).catch(() => null);
        if (notifRes?.data?.success) {
          setNotificationLogs(notifRes.data.data.logs || []);
          setNotifTotalPages(notifRes.data.data.pagination?.totalPages || 1);
          setNotifTotal(notifRes.data.data.pagination?.total || 0);
        }
      } else if (activeTab === "admob") {
        const adRes = await api.get("/admin/ads/analytics").catch(() => null);
        if (adRes?.data?.success) setAdAnalytics(adRes.data.data);
      } else if (activeTab === "adlogs") {
        fetchAdLogs();
        fetchAdDiagnostics();
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
  }, [
    isLoggedIn,
    activeTab,
    userPage,
    userTierFilter,
    userActivityFilter,
    subPage,
    personaPage,
    personaSearch,
    convPage,
    convSearch,
    convPersonaFilter,
    convUserFilter,
    reportsPage,
    helpPage,
    notifPage,
  ]);

  // Vercel Cron & Auto-Trigger Execution
  const handleTriggerAutoNotification = async () => {
    setIsTriggeringCron(true);
    try {
      const res = await api.post("/admin/cron/trigger-notifications");
      showToast(res.data?.message || "Auto-trigger companion check-in job finished! 🚀");
      fetchCronJobStatus();
    } catch (err) {
      showToast("Auto-trigger error: " + (err.response?.data?.message || err.message));
    } finally {
      setIsTriggeringCron(false);
    }
  };

  const fetchCronJobStatus = async () => {
    try {
      const res = await api.get("/admin/cron/job-status");
      if (res.data?.success) {
        setCronJobStatus(res.data.data);
      }
    } catch (err) {
      console.warn("Failed to load cron status:", err.message);
    }
  };

  // AI Conversations inspection and management
  const handleViewTranscript = async (sessionId) => {
    setIsLoadingSession(true);
    try {
      const res = await api.get(`/admin/conversations/${sessionId}`);
      if (res.data?.success) {
        setActiveSession(res.data.data);
      }
    } catch (err) {
      showToast("Failed to load transcript: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleDeleteConversation = async (sessionId) => {
    if (!window.confirm("Are you sure you want to permanently delete this AI conversation thread?")) return;
    try {
      await api.delete(`/admin/conversations/${sessionId}`);
      showToast("Conversation thread deleted 🗑️");
      if (activeSession?._id === sessionId) setActiveSession(null);
      fetchData();
    } catch (err) {
      showToast("Error deleting conversation: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenConversationsForUser = (user) => {
    setConvUserFilter(user._id);
    setConvUserName(user.name || user.email || "Selected User");
    setConvSearch("");
    setConvPage(1);
    setActiveTab("conversations");
  };

  const handleImprovePersonaFromChat = (persona) => {
    if (!persona) return;
    setActiveSession(null);
    openPersonaModal(persona);
    setActiveTab("personas");
  };

  // Single User Deletion (cascading all records)
  const confirmDeleteSingleUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    try {
      const res = await api.delete(`/admin/users/${userToDelete._id}`);
      showToast(res.data?.message || `User ${userToDelete.name || userToDelete.email} and all data deleted.`);
      setUserToDelete(null);
      fetchData();
    } catch (err) {
      showToast("Error deleting user: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Bulk Wipe: Delete All Non-Admin Users and all related data
  const handleDeleteAllUsers = async (e) => {
    e.preventDefault();
    if (deleteAllConfirmText !== "DELETE ALL USERS") {
      showToast("Confirmation text must match 'DELETE ALL USERS' exactly.");
      return;
    }
    setIsDeletingAll(true);
    try {
      const res = await api.post("/admin/users/delete-all", {
        confirmKeyword: "DELETE ALL USERS",
      });
      showToast(res.data?.message || "All users and related data permanently deleted.");
      setIsDeleteAllModalOpen(false);
      setDeleteAllConfirmText("");
      fetchData();
    } catch (err) {
      showToast("Error wiping users: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeletingAll(false);
    }
  };

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

  // Broadcast Notification & Delivery Inspection
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    try {
      const res = await api.post("/admin/notifications/send", {
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        imageUrl: broadcastImageUrl.trim(),
        targetType: broadcastTargetType,
        targetFilter:
          broadcastTargetType === "tier"
            ? broadcastTargetTier
            : broadcastTargetFilter.trim(),
        targetTier: broadcastTargetTier,
      });

      const stats = res.data?.data?.stats;
      showToast(
        stats
          ? `Dispatched! ${stats.sent} sent, ${stats.failed} failed, ${stats.noToken} no token 📢`
          : "Push notification dispatched! 📢"
      );
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastImageUrl("");
      setBroadcastTargetFilter("");

      // Refresh notification logs table
      const notifRes = await api.get("/admin/notifications?page=1&limit=30").catch(() => null);
      if (notifRes?.data?.success) setNotificationLogs(notifRes.data.data.logs || []);
    } catch (err) {
      showToast("Error sending notification: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const fetchRecipients = async (notifId, page = 1, search = recipientSearch, status = recipientStatusFilter) => {
    setRecipientsLoading(true);
    try {
      const q = new URLSearchParams({
        page,
        limit: 25,
        search,
        status,
      }).toString();
      const res = await api.get(`/admin/notifications/${notifId}/recipients?${q}`);
      if (res.data?.success) {
        setRecipientsList(res.data.data.recipients || []);
        setRecipientPage(res.data.data.page || 1);
        setRecipientTotalPages(res.data.data.totalPages || 1);
        setRecipientTotal(res.data.data.totalRecipients || 0);
      }
    } catch (err) {
      showToast("Error loading recipients: " + (err.response?.data?.message || err.message));
    } finally {
      setRecipientsLoading(false);
    }
  };

  const openRecipientsModal = async (notif) => {
    setSelectedNotification(notif);
    setRecipientModalOpen(true);
    setRecipientSearch("");
    setRecipientStatusFilter("all");
    setRecipientPage(1);
    fetchRecipients(notif._id, 1, "", "all");
  };

  const fetchAdLogs = async () => {
    setIsAdLogsLoading(true);
    try {
      const query = new URLSearchParams({
        page: adLogsPage,
        limit: 30,
        eventType: adLogsEventFilter,
        provider: adLogsProviderFilter,
        adType: adLogsTypeFilter,
        errorCode: adLogsErrorCodeFilter,
        search: adLogsSearch,
      }).toString();
      const res = await api.get(`/admin/ads/logs?${query}`);
      if (res.data?.success) {
        setAdLogsList(res.data.data.logs || []);
        setAdLogsTotalPages(res.data.data.pagination?.totalPages || 1);
        setAdLogsTotal(res.data.data.pagination?.total || 0);
      }
    } catch (err) {
      console.warn("Failed fetching ad logs:", err.message);
    } finally {
      setIsAdLogsLoading(false);
    }
  };

  const fetchAdDiagnostics = async () => {
    try {
      const res = await api.get("/admin/ads/diagnostics");
      if (res.data?.success) {
        setAdDiagnostics(res.data.data);
      }
    } catch (err) {
      console.warn("Failed fetching ad diagnostics:", err.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === "adlogs") {
      fetchAdLogs();
      fetchAdDiagnostics();
    }
  }, [adLogsPage, adLogsEventFilter, adLogsProviderFilter, adLogsTypeFilter, adLogsErrorCodeFilter, activeTab]);

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

  // Review safety report / feedback
  const handleReviewReport = async (reportId, newStatus) => {
    try {
      await api.post(`/admin/reports/${reportId}/review`, {
        status: newStatus,
        resolutionNotes: `Marked as ${newStatus} by admin`,
      });
      showToast(`Report marked as ${newStatus}!`);
      fetchData();
    } catch (err) {
      showToast("Error updating report: " + err.message);
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
            { id: "conversations", label: "AI Conversations", icon: MessageSquare },
            { id: "users", label: "User Directory", icon: Users },
            { id: "personas", label: "AI Personas", icon: Bot },
            { id: "subscriptions", label: "Subscriptions & Limits", icon: CreditCard },
            { id: "admob", label: "AdMob & Ad Credits", icon: Smartphone },
            { id: "adlogs", label: "Ad Telemetry & Failures", icon: AlertTriangle },
            { id: "theme", label: "Remote Theme Studio", icon: Palette },
            { id: "flags", label: "Feature Flags", icon: Sliders },
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
                : activeTab === "conversations"
                ? "User AI Conversations & Dialogue Improvement"
                : activeTab === "users"
                ? "User Directory & Account Management"
                : activeTab === "flags"
                ? "Dynamic Feature Flags & Switches"
                : activeTab === "admob"
                ? "Google AdMob & Freemium Rewards Studio"
                : activeTab === "adlogs"
                ? "AdMob & Meta Mediation Failure Telemetry"
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

              {/* Active Users & Retention Metrics (DAU, WAU, MAU) */}
              <div className="bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-purple-900/30 border border-pink-500/20 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> Real-time Active User Metrics & Retention (DAU / MAU)
                    </h3>
                    <p className="text-xs text-white/50">
                      Tracks user engagement frequencies, retention stickiness, and daily active companion usage.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Live Retention Engine
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#120F24]/80 border border-white/5 rounded-xl p-3.5">
                    <p className="text-[11px] text-white/50 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span> DAU (Daily Active)
                    </p>
                    <p className="text-xl font-bold mt-1 text-emerald-400">{stats.dau || 0}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Active in last 24 hours</p>
                  </div>

                  <div className="bg-[#120F24]/80 border border-white/5 rounded-xl p-3.5">
                    <p className="text-[11px] text-white/50 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span> WAU (Weekly Active)
                    </p>
                    <p className="text-xl font-bold mt-1 text-amber-400">{stats.wau || 0}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Active in last 7 days</p>
                  </div>

                  <div className="bg-[#120F24]/80 border border-white/5 rounded-xl p-3.5">
                    <p className="text-[11px] text-white/50 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span> MAU (Monthly Active)
                    </p>
                    <p className="text-xl font-bold mt-1 text-blue-400">{stats.mau || 0}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">Active in last 30 days</p>
                  </div>

                  <div className="bg-[#120F24]/80 border border-white/5 rounded-xl p-3.5">
                    <p className="text-[11px] text-white/50 font-medium flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-400"></span> Stickiness (DAU/MAU)
                    </p>
                    <p className="text-xl font-bold mt-1 text-pink-400">{stats.stickinessRatio || 0}%</p>
                    <p className="text-[10px] text-white/40 mt-0.5">User retention ratio</p>
                  </div>
                </div>
              </div>

              {/* Vercel Cron & Auto-Trigger Notification Engine Card */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-pink-400" /> Vercel Cron & Automated Engagement Engine
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Automatically detects inactive companion users and dispatches personalized AI re-engagement push notifications.
                    </p>
                  </div>

                  <button
                    onClick={handleTriggerAutoNotification}
                    disabled={isTriggeringCron}
                    className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 transition shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringCron ? "animate-spin" : ""}`} />
                    {isTriggeringCron ? "Dispatching Check-Ins..." : "Run Auto-Trigger Job Now"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5 text-xs">
                  <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[11px]">Vercel Cron Schedule</span>
                    <span className="font-mono font-semibold text-white">0 */4 * * * (Every 4h)</span>
                  </div>
                  <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[11px]">Vercel Endpoint Path</span>
                    <span className="font-mono font-semibold text-pink-300">/api/v2/cron/auto-notifications</span>
                  </div>
                  <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                    <span className="text-white/40 block text-[11px]">Eligible Inactive Users Now</span>
                    <span className="font-semibold text-emerald-400">
                      {cronJobStatus?.currentlyEligibleUsers ?? 0} users ready for check-in
                    </span>
                  </div>
                </div>

                {cronJobStatus?.lastRun && (
                  <div className="bg-white/5 p-3 rounded-xl text-[11px] text-white/60 flex items-center justify-between">
                    <span>
                      Last Auto-Trigger: <strong>{new Date(cronJobStatus.lastRun.sentAt).toLocaleString()}</strong> ({cronJobStatus.lastRun.stats?.sent ?? 0} sent)
                    </span>
                    <span className="text-emerald-400 font-semibold">✓ Active & Running</span>
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base">7-Day Activity & Active Users Trend</h3>
                    <p className="text-xs text-white/40">Daily Active Users (DAU), chat sessions, and voice calls</p>
                  </div>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.activityTrend?.length ? stats.activityTrend : activityData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
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
                      <Area type="monotone" dataKey="activeUsers" stroke="#10B981" fillOpacity={1} fill="url(#colorUsers)" name="Active Users (DAU)" />
                      <Area type="monotone" dataKey="messages" stroke="#FF4B72" fillOpacity={1} fill="url(#colorMsgs)" name="Chat Messages" />
                      <Area type="monotone" dataKey="calls" stroke="#7C4DFF" fillOpacity={1} fill="url(#colorCalls)" name="Voice Calls" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AI CONVERSATIONS & THREADS */}
          {activeTab === "conversations" && (
            <div className="space-y-6">
              {/* Header / Filter Toolbar */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-pink-400" /> User AI Conversation Threads
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      Inspect complete conversational dialogue transcripts between users and AI companions to evaluate responses, detect issues, and refine system prompts.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 bg-pink-500/10 text-pink-300 border border-pink-500/20 rounded-xl font-medium">
                      Total Threads: {convTotal}
                    </span>
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-white/5">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search messages, user name, email..."
                      value={convSearch}
                      onChange={(e) => {
                        setConvSearch(e.target.value);
                        setConvPage(1);
                      }}
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <select
                      value={convPersonaFilter}
                      onChange={(e) => {
                        setConvPersonaFilter(e.target.value);
                        setConvPage(1);
                      }}
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                    >
                      <option value="">All Companion Personas</option>
                      {personas.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.gender || "companion"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between gap-2">
                    {convUserFilter ? (
                      <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs text-purple-300 w-full justify-between">
                        <span className="truncate">
                          Filtered by user: <strong>{convUserName}</strong>
                        </span>
                        <button
                          onClick={() => {
                            setConvUserFilter("");
                            setConvUserName("");
                            setConvPage(1);
                          }}
                          className="text-white/60 hover:text-white p-0.5 rounded hover:bg-white/10"
                          title="Clear user filter"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-white/40 italic">
                        Viewing conversations across all users
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setConvSearch("");
                        setConvPersonaFilter("");
                        setConvUserFilter("");
                        setConvUserName("");
                        setConvPage(1);
                        fetchData();
                      }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-xs shrink-0 transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Conversations List */}
              {conversations.length === 0 ? (
                <div className="bg-[#161329] border border-white/5 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-white/40">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold">No Conversation Threads Found</h4>
                  <p className="text-xs text-white/50 max-w-sm mx-auto">
                    No conversations match the current filter or users have not engaged with companions yet.
                  </p>
                </div>
              ) : (
                <div className="bg-[#161329] border border-white/5 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-white/40 bg-[#120F24]/50">
                          <th className="py-3.5 px-4">User</th>
                          <th>AI Companion</th>
                          <th>Messages</th>
                          <th>Latest Snippet</th>
                          <th>Last Activity</th>
                          <th className="text-right px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {conversations.map((c) => {
                          const user = c.user || {};
                          const persona = c.persona || {};
                          const lastMsg = c.lastMessage;
                          return (
                            <tr key={c._id} className="hover:bg-white/5 transition">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-[11px] font-bold uppercase shrink-0">
                                    {(user.name || user.email || "U").slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-white truncate max-w-[150px]">
                                      {user.name || "Anonymous User"}
                                    </p>
                                    <p className="text-[11px] text-white/40 truncate max-w-[150px]">{user.email}</p>
                                    <span
                                      className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase mt-0.5 ${
                                        user.subscriptionTier === "premium"
                                          ? "text-amber-400 bg-amber-500/10"
                                          : user.subscriptionTier === "basic"
                                          ? "text-blue-400 bg-blue-500/10"
                                          : "text-white/40 bg-white/5"
                                      }`}
                                    >
                                      {user.subscriptionTier || "free"}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={persona.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                                    alt={persona.name}
                                    className="w-8 h-8 rounded-full object-cover border"
                                    style={{ borderColor: persona.accentColor || "#FF4B72" }}
                                  />
                                  <div>
                                    <p className="font-semibold text-white">{persona.name || "Unnamed Persona"}</p>
                                    <p className="text-[10px] text-white/40">
                                      {persona.voiceStyle || "sweet"} • {persona.openrouterModel ? persona.openrouterModel.split("/").pop() : "Llama"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="text-[11px] space-y-0.5">
                                  <span className="font-semibold text-white">{c.messageCount} total msgs</span>
                                  {c.voiceMessageCount > 0 && (
                                    <span className="text-[10px] text-white/40 block">
                                      🎙️ {c.voiceMessageCount} voice
                                    </span>
                                  )}
                                  <span className="text-[9px] text-white/30 uppercase block">Lang: {c.language}</span>
                                </div>
                              </td>
                              <td className="max-w-xs">
                                {lastMsg ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-[10px]">
                                      <span
                                        className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8.5px] ${
                                          lastMsg.role === "user"
                                            ? "bg-pink-500/20 text-pink-400"
                                            : "bg-purple-500/20 text-purple-400"
                                        }`}
                                      >
                                        {lastMsg.role}
                                      </span>
                                      {lastMsg.inputSource && lastMsg.inputSource !== "text" && (
                                        <span className="text-[9px] text-white/40 bg-white/5 px-1 rounded">
                                          {lastMsg.inputSource}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-white/70 line-clamp-2 italic">
                                      "{lastMsg.content}"
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-white/30 text-[11px] italic">No messages yet</span>
                                )}
                              </td>
                              <td>
                                <div className="text-[11px] text-white/60 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-white/30 shrink-0" />
                                  <span>{c.lastActivityAt ? new Date(c.lastActivityAt).toLocaleString() : "Recently"}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleViewTranscript(c._id)}
                                    className="px-2.5 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-pink-300 border border-pink-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Transcript
                                  </button>
                                  <button
                                    onClick={() => handleDeleteConversation(c._id)}
                                    className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                    title="Delete conversation thread"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {convTotalPages > 1 && (
                    <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-white/50">
                        Page {convPage} of {convTotalPages} ({convTotal} conversations)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={convPage <= 1}
                          onClick={() => setConvPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                        <button
                          disabled={convPage >= convTotalPages}
                          onClick={() => setConvPage((p) => Math.min(convTotalPages, p + 1))}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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

              {/* Personas Pagination */}
              {personaTotalPages > 1 && (
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/50">
                    Page <strong className="text-white">{personaPage}</strong> of{" "}
                    <strong className="text-white">{personaTotalPages}</strong> ({personaTotal} total)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={personaPage <= 1}
                      onClick={() => setPersonaPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={personaPage >= personaTotalPages}
                      onClick={() => setPersonaPage((p) => Math.min(personaTotalPages, p + 1))}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
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

                {/* Subscriptions Pagination */}
                {subTotalPages > 1 && (
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      Page <strong className="text-white">{subPage}</strong> of{" "}
                      <strong className="text-white">{subTotalPages}</strong> ({subTotal} total)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={subPage <= 1}
                        onClick={() => setSubPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <button
                        disabled={subPage >= subTotalPages}
                        onClick={() => setSubPage((p) => Math.min(subTotalPages, p + 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
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
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={userActivityFilter}
                    onChange={(e) => {
                      setUserActivityFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="">All Activity Status</option>
                    <option value="dau">🟢 Daily Active (DAU)</option>
                    <option value="wau">🟡 Weekly Active (WAU)</option>
                    <option value="mau">🔵 Monthly Active (MAU)</option>
                    <option value="inactive">⚪ Inactive (&gt;30d)</option>
                  </select>
                  <select
                    value={userTierFilter}
                    onChange={(e) => {
                      setUserTierFilter(e.target.value);
                      setUserPage(1);
                    }}
                    className="bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-pink-500"
                  >
                    <option value="">All Tiers</option>
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                  </select>
                  <button
                    onClick={() => {
                      setDeleteAllConfirmText("");
                      setIsDeleteAllModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow-sm"
                    title="Bulk purge all non-admin users and their conversation data"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete All Users
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 pb-2">
                      <th className="py-3">User</th>
                      <th>Activity Status</th>
                      <th>Gender</th>
                      <th>Language</th>
                      <th>Subscription</th>
                      <th>Usage (Today)</th>
                      <th>Bonus Balance</th>
                      <th>Onboarded</th>
                      <th className="text-right pr-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5">
                        <td className="py-3">
                          <div>
                            <p className="font-semibold text-white">{u.name || "Anonymous User"}</p>
                            <p className="text-[11px] text-white/40">{u.email}</p>
                            {u.lastActiveAt && (
                              <p className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" /> {new Date(u.lastActiveAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td>
                          {u.activityBadge === "DAU" ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> DAU
                            </span>
                          ) : u.activityBadge === "WAU" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              WAU
                            </span>
                          ) : u.activityBadge === "MAU" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              MAU
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white/40">
                              Inactive
                            </span>
                          )}
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
                        <td>
                          <div className="text-[11px] space-y-0.5">
                            <span className="text-white/80">💬 {u.dailyUsage?.textMessagesToday ?? u.dailyMessageCount ?? 0} msgs</span>
                            <span className="text-white/40 block">🎙️ {u.dailyVoiceMessageCount ?? 0} voice | 📞 {u.dailyUsage?.callMinutesToday ?? 0}m</span>
                          </div>
                        </td>
                        <td>
                          <div className="text-[11px] text-pink-300">
                            +{u.bonusChatMessages || 0} msgs | +{u.bonusCallMinutes || 0}m
                          </div>
                        </td>
                        <td>{u.onboardingComplete ? "✅ Yes" : "⏳ Pending"}</td>
                        <td className="text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenConversationsForUser(u)}
                              className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded text-[11px] font-semibold transition flex items-center gap-1"
                              title="Inspect AI chats for this user"
                            >
                              <MessageSquare className="w-3 h-3" /> Chats
                            </button>
                            <button
                              onClick={() => handleToggleBlock(u._id)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold transition ${
                                u.isBlocked
                                  ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                  : "bg-white/5 text-white/60 hover:bg-white/10"
                              }`}
                            >
                              {u.isBlocked ? "Unblock" : "Block"}
                            </button>
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                              title="Delete user & all related data"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Users Pagination */}
              {userTotalPages > 1 && (
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/50">
                    Page {userPage} of {userTotalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>
                    <button
                      disabled={userPage >= userTotalPages}
                      onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: PUSH NOTIFICATIONS & AUDIT CENTER */}
          {activeTab === "broadcast" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5 text-pink-500" /> Push Notification Management
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Compose & dispatch targeted push notifications to user devices, track live delivery status, and inspect recipient logs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    api.get("/admin/notifications?page=1&limit=30").then((res) => {
                      if (res.data?.success) setNotificationLogs(res.data.data.logs || []);
                      showToast("Notification logs refreshed! 🔄");
                    });
                  }}
                  className="px-4 py-2 bg-[#0E0C1C] border border-white/10 hover:border-pink-500/50 rounded-xl text-xs font-medium flex items-center gap-2 text-white/80 hover:text-white transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh History
                </button>
              </div>

              {/* Two Column Grid: Composer & Mobile Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column 1: Notification Composer (7 cols) */}
                <div className="lg:col-span-7 bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h4 className="font-bold text-sm text-pink-400 flex items-center gap-2">
                      <Send className="w-4 h-4" /> Compose Notification
                    </h4>
                    <span className="text-[11px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                      FCM Multicast Engine
                    </span>
                  </div>

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    {/* Audience Target Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-1.5">
                        Target Audience
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: "all", label: "All Users" },
                          { id: "gender", label: "By Gender" },
                          { id: "tier", label: "By Tier" },
                          { id: "user", label: "Single User" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setBroadcastTargetType(t.id);
                              if (t.id === "all") setBroadcastTargetFilter("");
                              else if (t.id === "gender") setBroadcastTargetFilter("female");
                              else if (t.id === "tier") setBroadcastTargetTier("free");
                            }}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                              broadcastTargetType === t.id
                                ? "bg-pink-500/20 border-pink-500 text-pink-400 shadow-md shadow-pink-500/10"
                                : "bg-[#0E0C1C] border-white/10 text-white/60 hover:text-white hover:border-white/20"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Secondary Filters based on targetType */}
                    {broadcastTargetType === "gender" && (
                      <div>
                        <label className="block text-xs text-white/70 mb-1">Select Gender</label>
                        <select
                          value={broadcastTargetFilter || "female"}
                          onChange={(e) => setBroadcastTargetFilter(e.target.value)}
                          className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="female">Women Only 👩</option>
                          <option value="male">Men Only 👨</option>
                          <option value="non-binary">Non-Binary Only ✨</option>
                        </select>
                      </div>
                    )}

                    {broadcastTargetType === "tier" && (
                      <div>
                        <label className="block text-xs text-white/70 mb-1">Select Subscription Tier</label>
                        <select
                          value={broadcastTargetTier}
                          onChange={(e) => setBroadcastTargetTier(e.target.value)}
                          className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="free">Free Tier Users Only</option>
                          <option value="basic">Basic Subscribers Only</option>
                          <option value="premium">Premium VIPs Only</option>
                        </select>
                      </div>
                    )}

                    {broadcastTargetType === "user" && (
                      <div>
                        <label className="block text-xs text-white/70 mb-1">Target User Email</label>
                        <input
                          type="email"
                          value={broadcastTargetFilter}
                          onChange={(e) => setBroadcastTargetFilter(e.target.value)}
                          placeholder="e.g. user@aidating.com"
                          className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          required
                        />
                      </div>
                    )}

                    {/* Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-white/80 font-medium">Notification Title</label>
                        <div className="flex gap-1 text-[10px] text-white/40">
                          {["💌", "✨", "💕", "💋", "🔥"].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setBroadcastTitle((t) => t + emoji)}
                              className="hover:scale-125 transition px-1"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. Sophia left you a sweet voice note 💌"
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        required
                      />
                    </div>

                    {/* Message Body */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-white/80 font-medium">Message Content</label>
                        <span className="text-[10px] text-white/40">{broadcastMessage.length}/500 chars</span>
                      </div>
                      <textarea
                        rows={3}
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="I was just wondering what you were doing right now... Tap to listen to what I said!"
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                        maxLength={500}
                        required
                      />
                    </div>

                    {/* Optional Image Banner URL */}
                    <div>
                      <label className="block text-xs text-white/80 font-medium mb-1 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-white/50" /> Image Banner URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={broadcastImageUrl}
                        onChange={(e) => setBroadcastImageUrl(e.target.value)}
                        placeholder="https://example.com/notification-banner.jpg"
                        className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isSendingBroadcast ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching to FCM...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Send Push Notification Now
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Column 2: Live Phone Device Mockup Preview (5 cols) */}
                <div className="lg:col-span-5 bg-[#161329] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white/80 flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-purple-400" /> Device Notification Preview
                    </h4>
                    <p className="text-xs text-white/40 mb-6">
                      Simulates real lock-screen & banner rendering on Android / iOS
                    </p>

                    {/* Phone Mockup Frame */}
                    <div className="mx-auto max-w-[320px] bg-[#0E0C1C] border-2 border-white/10 rounded-[32px] p-3 shadow-2xl relative">
                      {/* Speaker Notch */}
                      <div className="w-24 h-4 bg-black/60 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                      </div>

                      {/* Mock Notification Banner Card */}
                      <div className="bg-[#1C1733]/90 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 shadow-lg space-y-2 text-left">
                        {/* Notification App Header */}
                        <div className="flex items-center justify-between text-[11px] text-white/60">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                              AI
                            </div>
                            <span className="font-semibold text-white/90">Mingle AI Dating</span>
                          </div>
                          <span className="text-[10px] text-white/40">now</span>
                        </div>

                        {/* Title & Body */}
                        <div>
                          <p className="text-xs font-bold text-white line-clamp-1">
                            {broadcastTitle || "Sophia sent you a message 💌"}
                          </p>
                          <p className="text-[11px] text-white/70 line-clamp-2 mt-0.5 leading-snug">
                            {broadcastMessage || "Hey! I was thinking about you... tap to open our chat."}
                          </p>
                        </div>

                        {/* Optional Attached Image Preview */}
                        {broadcastImageUrl ? (
                          <div className="mt-2 rounded-xl overflow-hidden max-h-32 border border-white/10">
                            <img
                              src={broadcastImageUrl}
                              alt="Notification Banner"
                              className="w-full h-24 object-cover"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Bottom Home Indicator */}
                      <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-8"></div>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-[11px] text-white/40 border-t border-white/5 pt-3">
                    Audience:{" "}
                    <span className="text-pink-400 font-semibold">
                      {broadcastTargetType === "all"
                        ? "All Registered Devices"
                        : broadcastTargetType === "gender"
                        ? `Gender: ${broadcastTargetFilter || "female"}`
                        : broadcastTargetType === "tier"
                        ? `Tier: ${broadcastTargetTier}`
                        : `User: ${broadcastTargetFilter || "specific"}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification History & Recipient Delivery Log Table */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div>
                    <h4 className="font-bold text-base flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-500" /> Sent Notifications History & Delivery Logs
                    </h4>
                    <p className="text-xs text-white/50">
                      Audit past dispatches, delivery success rates, and inspect the exact list of recipients who received each alert.
                    </p>
                  </div>
                  <span className="text-xs text-white/60 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                    Total Dispatches: <strong className="text-white">{notificationLogs.length}</strong>
                  </span>
                </div>

                {notificationLogs.length === 0 ? (
                  <div className="text-center py-12 text-white/40 text-xs">
                    No push notifications have been dispatched yet. Compose and send your first announcement above!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40 font-semibold">
                          <th className="pb-3 pr-4">Sent At</th>
                          <th className="pb-3 px-4">Title & Message</th>
                          <th className="pb-3 px-4">Target Audience</th>
                          <th className="pb-3 px-4 text-center">Delivery Status</th>
                          <th className="pb-3 pl-4 text-right">Recipients Audit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {notificationLogs.map((log) => {
                          const total = log.stats?.total || 0;
                          const sent = log.stats?.sent || 0;
                          const failed = log.stats?.failed || 0;
                          const noToken = log.stats?.noToken || 0;

                          return (
                            <tr key={log._id} className="hover:bg-white/[0.02] transition">
                              {/* Sent Date */}
                              <td className="py-4 pr-4 whitespace-nowrap text-white/60">
                                <div className="font-medium text-white/90">
                                  {new Date(log.sentAt || log.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-[10px] text-white/40">
                                  {new Date(log.sentAt || log.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </td>

                              {/* Title & Body */}
                              <td className="py-4 px-4 min-w-[240px]">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  {log.title}
                                  {log.imageUrl ? (
                                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-normal">
                                      Image
                                    </span>
                                  ) : null}
                                </div>
                                <div className="text-white/60 text-[11px] line-clamp-1 mt-0.5">
                                  {log.body}
                                </div>
                              </td>

                              {/* Target */}
                              <td className="py-4 px-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 text-white/80 border border-white/10 uppercase">
                                  {log.targetType === "all"
                                    ? "All Users"
                                    : log.targetType === "gender"
                                    ? `Gender: ${log.targetFilter}`
                                    : log.targetType === "tier"
                                    ? `Tier: ${log.targetFilter || log.targetTier}`
                                    : `Email: ${log.targetFilter}`}
                                </span>
                              </td>

                              {/* Stats / Delivery */}
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <div className="inline-flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                                    ✓ {sent} Delivered
                                  </span>
                                  {failed > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-bold">
                                      ✕ {failed} Failed
                                    </span>
                                  )}
                                  {noToken > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[11px] font-bold">
                                      {noToken} No Token
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* View Recipients Action */}
                              <td className="py-4 pl-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => openRecipientsModal(log)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 border border-pink-500/40 text-pink-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 ml-auto transition shadow-sm"
                                >
                                  <Users className="w-3.5 h-3.5" /> View Recipients
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Broadcasts Pagination */}
                {notifTotalPages > 1 && (
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      Page <strong className="text-white">{notifPage}</strong> of{" "}
                      <strong className="text-white">{notifTotalPages}</strong> ({notifTotal} broadcasts)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={notifPage <= 1}
                        onClick={() => setNotifPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <button
                        disabled={notifPage >= notifTotalPages}
                        onClick={() => setNotifPage((p) => Math.min(notifTotalPages, p + 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: MODERATION & TICKETS */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              {/* 🛡️ Child Safety Reports & In-App Feedback Mechanism */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" /> Child Safety Standards, CSAE Reports & In-App Feedback
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Reports submitted via the Google Play Child Safety in-app feedback mechanism. Reviewed within 24h.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-xs font-bold">
                    {reports.filter((r) => r.status === "pending").length} Pending Review
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-white/40 pb-2">
                        <th className="py-3">Type & Reason</th>
                        <th>Reporter</th>
                        <th>Target</th>
                        <th>Description / Details</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reports.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-6 text-white/40">
                            No reports or safety submissions logged
                          </td>
                        </tr>
                      ) : (
                        reports.map((r) => {
                          const isChildSafety =
                            r.category === "child_safety_csae" ||
                            r.reason === "child_safety_csae" ||
                            (r.description && r.description.toLowerCase().includes("child"));

                          return (
                            <tr key={r._id} className="hover:bg-white/5">
                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isChildSafety
                                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                      : r.category === "inappropriate_content"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : r.category === "app_feedback"
                                      ? "bg-blue-500/20 text-blue-300"
                                      : "bg-purple-500/20 text-purple-300"
                                  }`}
                                >
                                  {isChildSafety
                                    ? "🛡️ Child Safety / CSAE"
                                    : r.category || r.reason || "Safety Report"}
                                </span>
                              </td>
                              <td>
                                <div>
                                  <p className="font-semibold">{r.reporterId?.name || "User"}</p>
                                  <p className="text-[11px] text-white/40">{r.reporterId?.email || "—"}</p>
                                </div>
                              </td>
                              <td>
                                {r.personaId ? (
                                  <span className="text-pink-300 font-medium">🤖 {r.personaId.name}</span>
                                ) : r.reportedUserId ? (
                                  <span>👤 {r.reportedUserId.name || r.reportedUserId.email}</span>
                                ) : (
                                  <span className="text-white/40">App System</span>
                                )}
                              </td>
                              <td className="max-w-xs text-white/80">
                                <p className="truncate" title={r.description || r.reason}>
                                  {r.description || r.reason}
                                </p>
                              </td>
                              <td className="text-white/40 whitespace-nowrap">
                                {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                              </td>
                              <td>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    r.status === "resolved"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : r.status === "rejected"
                                      ? "bg-white/10 text-white/40"
                                      : "bg-red-500/20 text-red-400 animate-pulse"
                                  }`}
                                >
                                  {r.status || "pending"}
                                </span>
                              </td>
                              <td>
                                <div className="flex items-center gap-1.5">
                                  {r.status !== "resolved" && (
                                    <button
                                      onClick={() => handleReviewReport(r._id, "resolved")}
                                      className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[11px] font-medium transition"
                                      title="Mark Resolved"
                                    >
                                      Resolve
                                    </button>
                                  )}
                                  {r.status !== "rejected" && (
                                    <button
                                      onClick={() => handleReviewReport(r._id, "rejected")}
                                      className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white/60 rounded text-[11px] font-medium transition"
                                      title="Dismiss"
                                    >
                                      Dismiss
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Reports Pagination */}
                {reportsTotalPages > 1 && (
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      Page <strong className="text-white">{reportsPage}</strong> of{" "}
                      <strong className="text-white">{reportsTotalPages}</strong> ({reportsTotal} total)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={reportsPage <= 1}
                        onClick={() => setReportsPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <button
                        disabled={reportsPage >= reportsTotalPages}
                        onClick={() => setReportsPage((p) => Math.min(reportsTotalPages, p + 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Support & Help Tickets */}
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

                {/* Help Tickets Pagination */}
                {helpTotalPages > 1 && (
                  <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      Page <strong className="text-white">{helpPage}</strong> of{" "}
                      <strong className="text-white">{helpTotalPages}</strong> ({helpTotal} total)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={helpPage <= 1}
                        onClick={() => setHelpPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <button
                        disabled={helpPage >= helpTotalPages}
                        onClick={() => setHelpPage((p) => Math.min(helpTotalPages, p + 1))}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1 transition"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: ADMOB & FREEMIUM REWARDS STUDIO */}
          {activeTab === "admob" && (
            <div className="space-y-6 max-w-4xl">
              {/* Header Card */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-pink-500" /> Google AdMob & Freemium Ad Credits
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    Control AdMob App IDs, Ad Unit IDs, and bonus credits granted when users watch rewarded ads.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-[#0E0C1C] px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
                  <span className="text-xs text-white/70 font-medium">Global AdMob:</span>
                  <button
                    onClick={() => setSysConfig({ ...sysConfig, admobEnabled: !sysConfig.admobEnabled })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      sysConfig.admobEnabled
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {sysConfig.admobEnabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              </div>

              {/* Ad Impression Analytics & Live Tracking */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="font-bold text-sm text-pink-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Live Ad Impression Tracking
                    </h4>
                    <p className="text-xs text-white/50">
                      Real-time analytics for all rewarded video, interstitial, and banner ads rendered in the app.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      api.get("/admin/ads/analytics").then((res) => {
                        if (res.data?.success) setAdAnalytics(res.data.data);
                        showToast("Ad analytics refreshed! 📊");
                      });
                    }}
                    className="px-3 py-1.5 bg-[#0E0C1C] border border-white/10 rounded-lg text-xs font-medium flex items-center gap-1.5 text-white/70 hover:text-white transition self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </button>
                </div>

                {/* KPI Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-3.5">
                    <span className="text-[11px] text-white/50 font-medium">Total Ads Served</span>
                    <div className="text-xl font-extrabold text-white mt-1">
                      {adAnalytics?.totalImpressions ?? 0}
                    </div>
                  </div>
                  <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-3.5">
                    <span className="text-[11px] text-white/50 font-medium">Today's Impressions</span>
                    <div className="text-xl font-extrabold text-emerald-400 mt-1">
                      {adAnalytics?.todayImpressions ?? 0}
                    </div>
                  </div>
                  <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-3.5">
                    <span className="text-[11px] text-white/50 font-medium">Rewarded Ads</span>
                    <div className="text-xl font-extrabold text-pink-400 mt-1">
                      {adAnalytics?.typeBreakdown?.find((t) => t._id === "rewarded")?.count ?? 0}
                    </div>
                  </div>
                  <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-3.5">
                    <span className="text-[11px] text-white/50 font-medium">Interstitials</span>
                    <div className="text-xl font-extrabold text-purple-400 mt-1">
                      {adAnalytics?.typeBreakdown?.find((t) => t._id === "interstitial" || t._id === "rewarded_interstitial")?.count ?? 0}
                    </div>
                  </div>
                </div>

                {/* Top Ad Viewers Table */}
                {adAnalytics?.topViewers && adAnalytics.topViewers.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-white/80 mb-2">Top Ad Viewers & Engagers</h5>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-white/40">
                            <th className="pb-2">User</th>
                            <th className="pb-2">Tier</th>
                            <th className="pb-2">Ads Watched</th>
                            <th className="pb-2 text-right">Last Ad Watched</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adAnalytics.topViewers.map((u, i) => (
                            <tr key={u._id || i}>
                              <td className="py-2.5 font-semibold text-white/90">
                                {u.name || u.email || "User"}
                              </td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 border border-white/10 text-white/70">
                                  {u.subscriptionTier || "free"}
                                </span>
                              </td>
                              <td className="py-2.5 font-bold text-pink-400">
                                {u.adsWatchedCount} views
                              </td>
                              <td className="py-2.5 text-right text-white/50 text-[11px]">
                                {u.lastAdWatchedAt ? new Date(u.lastAdWatchedAt).toLocaleDateString() : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Bonus Credits Configuration Card */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-pink-400">🎁 User Reward Credits (Granted on Ad Completion)</h4>
                  <p className="text-xs text-white/50">Configure free messages and voice call minutes users receive per completed ad</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rewarded Video */}
                  <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-semibold text-white">Full Rewarded Video Ad</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Standard Ad</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Free Chat Messages Granted</label>
                      <input
                        type="number"
                        min="1"
                        value={sysConfig.rewardedChatCredits ?? 5}
                        onChange={(e) => setSysConfig({ ...sysConfig, rewardedChatCredits: Number(e.target.value) })}
                        className="w-full bg-[#161329] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-pink-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Free Call Minutes Granted</label>
                      <input
                        type="number"
                        min="1"
                        value={sysConfig.rewardedCallMinutes ?? 2}
                        onChange={(e) => setSysConfig({ ...sysConfig, rewardedCallMinutes: Number(e.target.value) })}
                        className="w-full bg-[#161329] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Quick Rewarded Interstitial */}
                  <div className="bg-[#0E0C1C] border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-semibold text-white">Quick Rewarded Interstitial</span>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">Quick Ad</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Free Chat Messages Granted</label>
                      <input
                        type="number"
                        min="1"
                        value={sysConfig.rewardedInterstitialChatCredits ?? 3}
                        onChange={(e) => setSysConfig({ ...sysConfig, rewardedInterstitialChatCredits: Number(e.target.value) })}
                        className="w-full bg-[#161329] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-pink-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Free Call Minutes Granted</label>
                      <input
                        type="number"
                        min="1"
                        value={sysConfig.rewardedInterstitialCallMinutes ?? 1}
                        onChange={(e) => setSysConfig({ ...sysConfig, rewardedInterstitialCallMinutes: Number(e.target.value) })}
                        className="w-full bg-[#161329] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-purple-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-[#100D1F] p-4 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Daily Ad Fallback Safety Cap</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Revenue Protection</span>
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/60 mb-1">Max Daily Fallbacks (When Ads Fail / Empty)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={sysConfig.maxDailyAdFallbacks ?? 3}
                        onChange={(e) => setSysConfig({ ...sysConfig, maxDailyAdFallbacks: Number(e.target.value) })}
                        className="w-full bg-[#161329] border border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-amber-400 focus:outline-none"
                      />
                      <p className="text-[10px] text-white/40 mt-1">
                        When ads fail to load, users receive at most {sysConfig.maxDailyAdFallbacks ?? 3} free credits ({(sysConfig.maxDailyAdFallbacks ?? 3) * (sysConfig.rewardedChatCredits ?? 5)} chat messages). After this, they are asked to try again once an ad is ready.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AdMob IDs Card */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-pink-400">🆔 AdMob App & Unit IDs</h4>
                  <p className="text-xs text-white/50">Overrides default test IDs with your production Google AdMob IDs dynamically. Each format must have a distinct unit ID in AdMob.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Android AdMob App ID</label>
                    <input
                      type="text"
                      value={sysConfig.admobAppIdAndroid || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, admobAppIdAndroid: e.target.value })}
                      placeholder="ca-app-pub-xxxxxxxx~yyyyyyyy"
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">iOS AdMob App ID</label>
                    <input
                      type="text"
                      value={sysConfig.admobAppIdIos || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, admobAppIdIos: e.target.value })}
                      placeholder="ca-app-pub-xxxxxxxx~yyyyyyyy"
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Rewarded Video Ad Unit ID</label>
                    <input
                      type="text"
                      value={sysConfig.admobRewardedAdUnitId || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, admobRewardedAdUnitId: e.target.value })}
                      placeholder="ca-app-pub-xxxxxxxx/yyyyyyyy"
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-white/40 block mt-0.5">Must be created as 'Rewarded' in AdMob</span>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Rewarded Interstitial Ad Unit ID</label>
                    <input
                      type="text"
                      value={sysConfig.admobRewardedInterstitialAdUnitId || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, admobRewardedInterstitialAdUnitId: e.target.value })}
                      placeholder="ca-app-pub-xxxxxxxx/yyyyyyyy"
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-white/40 block mt-0.5">Must be created as 'Rewarded Interstitial' in AdMob</span>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Banner Ad Unit ID (Optional)</label>
                    <input
                      type="text"
                      value={sysConfig.admobBannerAdUnitId || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, admobBannerAdUnitId: e.target.value })}
                      placeholder="ca-app-pub-xxxxxxxx/yyyyyyyy"
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-white/40 block mt-0.5">Must be created as 'Banner' in AdMob</span>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Interstitial Ad Unit ID (Optional)</label>
                    <input
                      type="text"
                      value={sysConfig.admobInterstitialAdUnitId || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, admobInterstitialAdUnitId: e.target.value })}
                      placeholder="ca-app-pub-xxxxxxxx/yyyyyyyy"
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-pink-500"
                    />
                    <span className="text-[10px] text-amber-400/70 block mt-0.5">Do not reuse Rewarded Interstitial ID (causes Format Mismatch error)</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={handleSaveConfig}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 hover:opacity-90 transition"
                  >
                    <Save className="w-4 h-4" /> Save AdMob & Credit Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AD TELEMETRY & FAILURE LOGS */}
          {activeTab === "adlogs" && (
            <div className="space-y-6">
              {/* Diagnostic Overview Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        Ad Mediation Failure Diagnostics & Troubleshooting
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                          Live Telemetry
                        </span>
                      </h3>
                      <p className="text-xs text-white/70 max-w-3xl leading-relaxed">
                        Tracking real-time ad load and show failures across Google AdMob and Meta Audience Network bidding.
                        When ads do not show, Google Error Code 3 (<strong className="text-amber-300 font-semibold">NO_FILL</strong>) indicates no inventory was returned by ad networks for this auction. If users watch ads before pre-fetching completes, a <strong className="text-pink-300 font-semibold">not_ready_fallback</strong> credit is granted gracefully.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        fetchAdLogs();
                        fetchAdDiagnostics();
                      }}
                      disabled={isAdLogsLoading}
                      className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAdLogsLoading ? "animate-spin" : ""}`} /> Refresh Telemetry
                    </button>
                  </div>
                </div>

                {/* Error Code Reference Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10 text-[11px]">
                  <div className="bg-[#120F24]/80 p-2.5 rounded-xl border border-white/5">
                    <span className="font-bold text-amber-400 block mb-0.5">Code 3: NO_FILL</span>
                    <span className="text-white/50 text-[10px]">No ad inventory available from Google or Meta.</span>
                  </div>
                  <div className="bg-[#120F24]/80 p-2.5 rounded-xl border border-white/5">
                    <span className="font-bold text-red-400 block mb-0.5">Code 1: INVALID_REQUEST</span>
                    <span className="text-white/50 text-[10px]">Malformed unit ID, missing bundle ID or placement mismatch.</span>
                  </div>
                  <div className="bg-[#120F24]/80 p-2.5 rounded-xl border border-white/5">
                    <span className="font-bold text-sky-400 block mb-0.5">Code 2: NETWORK_ERROR</span>
                    <span className="text-white/50 text-[10px]">Device offline or firewall blocked ad server connection.</span>
                  </div>
                  <div className="bg-[#120F24]/80 p-2.5 rounded-xl border border-white/5">
                    <span className="font-bold text-purple-400 block mb-0.5">Code 0: INTERNAL_ERROR</span>
                    <span className="text-white/50 text-[10px]">Unexpected SDK or adapter failure during auction.</span>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-[#161329] border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center justify-between text-white/40 mb-2">
                    <span className="text-xs font-medium">Total Events</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {adDiagnostics?.totalLogs ?? adLogsTotal}
                  </div>
                  <div className="text-[11px] text-white/40 mt-1">Logged requests & shows</div>
                </div>

                <div className="bg-[#161329] border border-rose-500/20 rounded-2xl p-4 bg-gradient-to-b from-rose-500/5 to-transparent">
                  <div className="flex items-center justify-between text-white/40 mb-2">
                    <span className="text-xs font-medium text-rose-300">Failed Loads</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-rose-400">
                      {adDiagnostics?.failedLoads ?? adDiagnostics?.totalLoadFailed ?? 0}
                    </span>
                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {typeof adDiagnostics?.failureRate === "number" ? `${adDiagnostics.failureRate}%` : (adDiagnostics?.failureRate ?? "0%")}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-300/60 mt-1">Auction failed to fill</div>
                </div>

                <div className="bg-[#161329] border border-emerald-500/20 rounded-2xl p-4 bg-gradient-to-b from-emerald-500/5 to-transparent">
                  <div className="flex items-center justify-between text-white/40 mb-2">
                    <span className="text-xs font-medium text-emerald-300">Successful Loads</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {adDiagnostics?.successfulLoads ?? adDiagnostics?.totalLoaded ?? Math.max(0, (adDiagnostics?.totalLoads ?? 0) - (adDiagnostics?.failedLoads ?? adDiagnostics?.totalLoadFailed ?? 0))}
                  </div>
                  <div className="text-[11px] text-emerald-300/60 mt-1">Ready for impression</div>
                </div>

                <div className="bg-[#161329] border border-amber-500/20 rounded-2xl p-4 bg-gradient-to-b from-amber-500/5 to-transparent">
                  <div className="flex items-center justify-between text-white/40 mb-2">
                    <span className="text-xs font-medium text-amber-300">Show Failures</span>
                    <XCircle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">
                    {adDiagnostics?.showFailures ?? adDiagnostics?.totalShowFailed ?? 0}
                  </div>
                  <div className="text-[11px] text-amber-300/60 mt-1">Render failed at show time</div>
                </div>

                <div className="bg-[#161329] border border-pink-500/20 rounded-2xl p-4 bg-gradient-to-b from-pink-500/5 to-transparent col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-white/40 mb-2">
                    <span className="text-xs font-medium text-pink-300">Not Ready Fallbacks</span>
                    <Clock className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="text-2xl font-bold text-pink-400">
                    {adDiagnostics?.fallbackCount ?? adDiagnostics?.notReadyFallbacks ?? 0}
                  </div>
                  <div className="text-[11px] text-pink-300/60 mt-1">Free credit granted w/o ad</div>
                </div>
              </div>

              {/* Providers & Error Distribution Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#161329] border border-white/5 rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-white/80 mb-3 flex items-center justify-between">
                    <span>Ad Provider Telemetry Share</span>
                    <Smartphone className="w-3.5 h-3.5 text-white/40" />
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Google AdMob
                        </span>
                        <span className="font-mono text-white/90">
                          {adDiagnostics?.providerCounts?.["Google AdMob"] ?? adDiagnostics?.providerBreakdown?.find(p => p._id?.includes('Google') || p._id?.includes('AdMob'))?.count ?? 0} events
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full transition-all"
                          style={{
                            width: `${
                              ((adDiagnostics?.providerCounts?.["Google AdMob"] ?? adDiagnostics?.providerBreakdown?.find(p => p._id?.includes('Google') || p._id?.includes('AdMob'))?.count ?? 0) /
                                Math.max(1, (adDiagnostics?.totalLogs ?? 1))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/70 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Meta Audience Network (Bidding)
                        </span>
                        <span className="font-mono text-white/90">
                          {adDiagnostics?.providerCounts?.["Meta Audience Network"] ?? adDiagnostics?.providerBreakdown?.find(p => p._id?.includes('Meta') || p._id?.includes('Facebook'))?.count ?? 0} events
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all"
                          style={{
                            width: `${
                              ((adDiagnostics?.providerCounts?.["Meta Audience Network"] ?? adDiagnostics?.providerBreakdown?.find(p => p._id?.includes('Meta') || p._id?.includes('Facebook'))?.count ?? 0) /
                                Math.max(1, (adDiagnostics?.totalLogs ?? 1))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#161329] border border-white/5 rounded-2xl p-4">
                  <h4 className="text-xs font-semibold text-white/80 mb-3 flex items-center justify-between">
                    <span>Error Code Occurrence Breakdown</span>
                    <Sliders className="w-3.5 h-3.5 text-white/40" />
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#100D1F] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-amber-400 font-medium">Code 3 (NO_FILL)</span>
                      <span className="font-mono font-bold text-white px-2 py-0.5 bg-amber-500/20 rounded">
                        {adDiagnostics?.errorCodeCounts?.["3"] ?? adDiagnostics?.errorCodesBreakdown?.filter(e => String(e._id?.code) === '3')?.reduce((acc, curr) => acc + curr.count, 0) ?? 0}
                      </span>
                    </div>
                    <div className="bg-[#100D1F] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-red-400 font-medium">Code 1 (INVALID_REQ)</span>
                      <span className="font-mono font-bold text-white px-2 py-0.5 bg-red-500/20 rounded">
                        {adDiagnostics?.errorCodeCounts?.["1"] ?? adDiagnostics?.errorCodesBreakdown?.filter(e => String(e._id?.code) === '1')?.reduce((acc, curr) => acc + curr.count, 0) ?? 0}
                      </span>
                    </div>
                    <div className="bg-[#100D1F] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-purple-400 font-medium">Code 0 (INTERNAL)</span>
                      <span className="font-mono font-bold text-white px-2 py-0.5 bg-purple-500/20 rounded">
                        {adDiagnostics?.errorCodeCounts?.["0"] ?? adDiagnostics?.errorCodesBreakdown?.filter(e => String(e._id?.code) === '0')?.reduce((acc, curr) => acc + curr.count, 0) ?? 0}
                      </span>
                    </div>
                    <div className="bg-[#100D1F] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                      <span className="text-sky-400 font-medium">Code 2 (NETWORK)</span>
                      <span className="font-mono font-bold text-white px-2 py-0.5 bg-sky-500/20 rounded">
                        {adDiagnostics?.errorCodeCounts?.["2"] ?? adDiagnostics?.errorCodesBreakdown?.filter(e => String(e._id?.code) === '2')?.reduce((acc, curr) => acc + curr.count, 0) ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={adLogsSearch}
                      onChange={(e) => setAdLogsSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setAdLogsPage(1);
                          fetchAdLogs();
                        }
                      }}
                      placeholder="Search by user email, user name, error message, adapter..."
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-pink-500 text-white placeholder-white/30"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Event Type Filter */}
                    <select
                      value={adLogsEventFilter}
                      onChange={(e) => {
                        setAdLogsEventFilter(e.target.value);
                        setAdLogsPage(1);
                      }}
                      className="bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-pink-500"
                    >
                      <option value="all">All Events</option>
                      <option value="load_failed">Load Failed (NO_FILL / Errors)</option>
                      <option value="not_ready_fallback">Not Ready Fallback</option>
                      <option value="loaded">Loaded</option>
                      <option value="show_failed">Show Failed</option>
                      <option value="show_success">Show Success</option>
                      <option value="show_attempt">Show Attempt</option>
                      <option value="load_request">Load Request</option>
                    </select>

                    {/* Provider Filter */}
                    <select
                      value={adLogsProviderFilter}
                      onChange={(e) => {
                        setAdLogsProviderFilter(e.target.value);
                        setAdLogsPage(1);
                      }}
                      className="bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-pink-500"
                    >
                      <option value="all">All Providers</option>
                      <option value="Google AdMob">Google AdMob</option>
                      <option value="Meta Audience Network">Meta Audience Network</option>
                    </select>

                    {/* Ad Format Filter */}
                    <select
                      value={adLogsTypeFilter}
                      onChange={(e) => {
                        setAdLogsTypeFilter(e.target.value);
                        setAdLogsPage(1);
                      }}
                      className="bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-pink-500"
                    >
                      <option value="all">All Formats</option>
                      <option value="rewarded">Rewarded Video</option>
                      <option value="rewarded_interstitial">Rewarded Interstitial</option>
                      <option value="interstitial">Interstitial</option>
                    </select>

                    {/* Error Code Filter */}
                    <select
                      value={adLogsErrorCodeFilter}
                      onChange={(e) => {
                        setAdLogsErrorCodeFilter(e.target.value);
                        setAdLogsPage(1);
                      }}
                      className="bg-[#0E0C1C] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 focus:outline-none focus:border-pink-500"
                    >
                      <option value="all">All Error Codes</option>
                      <option value="3">Code 3: NO_FILL</option>
                      <option value="1">Code 1: INVALID_REQUEST</option>
                      <option value="0">Code 0: INTERNAL_ERROR</option>
                      <option value="2">Code 2: NETWORK_ERROR</option>
                    </select>

                    <button
                      onClick={() => {
                        setAdLogsPage(1);
                        fetchAdLogs();
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-semibold hover:opacity-90 transition shrink-0"
                    >
                      Apply
                    </button>

                    {(adLogsSearch || adLogsEventFilter !== "all" || adLogsProviderFilter !== "all" || adLogsTypeFilter !== "all" || adLogsErrorCodeFilter !== "all") && (
                      <button
                        onClick={() => {
                          setAdLogsSearch("");
                          setAdLogsEventFilter("all");
                          setAdLogsProviderFilter("all");
                          setAdLogsTypeFilter("all");
                          setAdLogsErrorCodeFilter("all");
                          setAdLogsPage(1);
                        }}
                        className="px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs text-white/60 hover:text-white transition"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Logs Table */}
              <div className="bg-[#161329] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">Ad Event & Error Telemetry Logs</h3>
                    <p className="text-xs text-white/40">Showing real-time records from mobile devices</p>
                  </div>
                  <span className="text-xs font-mono text-white/40">
                    Total: <strong className="text-white">{adLogsTotal}</strong> records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-white/40 uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Format & Placement</th>
                        <th className="py-3 px-4">Event Status</th>
                        <th className="py-3 px-4">Provider</th>
                        <th className="py-3 px-4">Error Diagnostics</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isAdLogsLoading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-white/40">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-pink-500" />
                            Loading telemetry logs...
                          </td>
                        </tr>
                      ) : adLogsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-white/40">
                            No ad telemetry logs match the current filters.
                          </td>
                        </tr>
                      ) : (
                        adLogsList.map((log) => {
                          const isFailed = log.eventType === "load_failed" || log.eventType === "show_failed";
                          const isFallback = log.eventType === "not_ready_fallback";
                          const isSuccess = log.eventType === "loaded" || log.eventType === "show_success";

                          return (
                            <tr key={log._id} className="hover:bg-white/[0.02] transition">
                              {/* Time */}
                              <td className="py-3 px-4 whitespace-nowrap text-white/60 text-[11px] font-mono">
                                {new Date(log.createdAt).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </td>

                              {/* User */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">
                                    {(log.userName || log.userEmail || "U")[0]?.toUpperCase()}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-white/90 font-medium text-xs max-w-[130px] truncate">
                                      {log.userName || "Guest / App User"}
                                    </span>
                                    <span className="text-white/40 text-[10px] max-w-[130px] truncate">
                                      {log.userEmail || log.userId || "anonymous"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Format & Placement */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="flex flex-col gap-0.5">
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white/90 w-fit">
                                    {log.adType}
                                  </span>
                                  <span className="text-[10px] text-white/40 font-mono truncate max-w-[120px]">
                                    {log.placement || "default"}
                                  </span>
                                </div>
                              </td>

                              {/* Event Status */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {isFailed ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                    <XCircle className="w-3 h-3" /> {log.eventType}
                                  </span>
                                ) : isFallback ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    <Clock className="w-3 h-3" /> not_ready_fallback
                                  </span>
                                ) : isSuccess ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> {log.eventType}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                                    <Activity className="w-3 h-3" /> {log.eventType}
                                  </span>
                                )}
                              </td>

                              {/* Provider */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    log.provider?.includes("Meta")
                                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  }`}
                                >
                                  {log.provider || "Google AdMob"}
                                </span>
                              </td>

                              {/* Error Diagnostics */}
                              <td className="py-3 px-4 max-w-xs">
                                {log.errorCode !== undefined && log.errorCode !== null ? (
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                        Code {log.errorCode}
                                      </span>
                                      <span className="text-white/40 text-[10px] font-mono truncate">
                                        {log.errorDomain || "admob"}
                                      </span>
                                    </div>
                                    <p className="text-white/80 text-[11px] truncate" title={log.errorMessage}>
                                      {log.errorMessage || "No description provided"}
                                    </p>
                                  </div>
                                ) : isFallback ? (
                                  <span className="text-amber-300/80 text-[11px]">
                                    User requested reward before ad finished caching.
                                  </span>
                                ) : (
                                  <span className="text-emerald-400/80 text-[11px] flex items-center gap-1">
                                    <Check className="w-3 h-3" /> OK / Cached
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedAdLog(log);
                                    setIsAdLogModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[11px] text-white/80 hover:text-white flex items-center gap-1.5 ml-auto transition"
                                >
                                  <Eye className="w-3 h-3" /> Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {adLogsTotalPages > 1 && (
                  <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-white/60">
                    <div>
                      Page <strong className="text-white">{adLogsPage}</strong> of{" "}
                      <strong className="text-white">{adLogsTotalPages}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdLogsPage((p) => Math.max(1, p - 1))}
                        disabled={adLogsPage <= 1}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                      </button>
                      <button
                        onClick={() => setAdLogsPage((p) => Math.min(adLogsTotalPages, p + 1))}
                        disabled={adLogsPage >= adLogsTotalPages}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
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

                {/* POSTHOG ANALYTICS DYNAMIC CONFIG */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-purple-400" /> PostHog Analytics & User Activity Tracing
                      </h4>
                      <p className="text-[10px] text-white/50">
                        Controls client-side event tracking, user journeys, and session replays dynamically.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSysConfig({ ...sysConfig, posthogEnabled: !sysConfig.posthogEnabled })}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        sysConfig.posthogEnabled
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : "bg-white/5 text-white/40 border border-white/10"
                      }`}
                    >
                      {sysConfig.posthogEnabled ? "ACTIVE" : "PAUSED"}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">PostHog Project Token (API Key)</label>
                    <input
                      type="text"
                      value={sysConfig.posthogApiKey || ""}
                      onChange={(e) => setSysConfig({ ...sysConfig, posthogApiKey: e.target.value })}
                      placeholder="phc_..."
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">PostHog Ingestion Host (Cloud Region)</label>
                    <select
                      value={sysConfig.posthogHost || "https://eu.i.posthog.com"}
                      onChange={(e) => setSysConfig({ ...sysConfig, posthogHost: e.target.value })}
                      className="w-full bg-[#0E0C1C] border border-white/10 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none focus:border-purple-500"
                    >
                      <option value="https://eu.i.posthog.com">EU Cloud (https://eu.i.posthog.com) - Project 309697</option>
                      <option value="https://us.i.posthog.com">US Cloud (https://us.i.posthog.com)</option>
                    </select>
                  </div>
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

      {/* FULL CONVERSATION TRANSCRIPT MODAL */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6">
          <div className="bg-[#141126] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-white/10 bg-[#161329] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={activeSession.personaId?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={activeSession.personaId?.name}
                  className="w-11 h-11 rounded-2xl object-cover border-2 shrink-0"
                  style={{ borderColor: activeSession.personaId?.accentColor || "#FF4B72" }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm md:text-base text-white truncate">
                      Chat with {activeSession.personaId?.name || "AI Companion"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                      {activeSession.messages?.length || 0} messages
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    User: <strong className="text-white/80">{activeSession.userId?.name || activeSession.userId?.email || "User"}</strong> ({activeSession.userId?.email || "No email"}) • Tier: <span className="uppercase font-semibold text-pink-400">{activeSession.userId?.subscriptionTier || "free"}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleImprovePersonaFromChat(activeSession.personaId)}
                  className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-pink-500/25 transition"
                  title="Tune this companion's system prompt and model based on this transcript"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Tune & Improve AI Prompt
                </button>
                <button
                  onClick={() => setActiveSession(null)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Persona Model & Prompt Bar */}
            <div className="bg-[#0E0C1C] px-5 py-2.5 border-b border-white/5 flex flex-wrap items-center justify-between text-[11px] gap-2">
              <div className="flex items-center gap-3 text-white/60">
                <span>Model: <strong className="text-white">{activeSession.personaId?.openrouterModel || "meta-llama/llama-3.3-70b-instruct"}</strong></span>
                <span>Voice: <strong className="text-white capitalize">{activeSession.personaId?.voiceStyle || "sweet"}</strong></span>
                <span>Dynamic: <strong className="text-white capitalize">{activeSession.personaId?.relationshipDynamic || "romantic-partner"}</strong></span>
              </div>
              <div className="text-white/40">
                Language: <strong className="text-white uppercase">{activeSession.language || "en"}</strong>
              </div>
            </div>

            {/* Transcript Messages Container */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4 bg-[#0B0917]/80">
              {activeSession.messages && activeSession.messages.length > 0 ? (
                activeSession.messages.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg._id || index}
                      className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 mt-1">
                        {isUser ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-md">
                            {(activeSession.userId?.name || "U").slice(0, 2)}
                          </div>
                        ) : (
                          <img
                            src={activeSession.personaId?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt="Companion"
                            className="w-8 h-8 rounded-full object-cover border shadow-md"
                            style={{ borderColor: activeSession.personaId?.accentColor || "#FF4B72" }}
                          />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className="space-y-1 min-w-0">
                        <div className={`flex items-center gap-2 text-[10px] text-white/40 ${isUser ? "justify-end" : "justify-start"}`}>
                          <span className="font-semibold text-white/60">
                            {isUser ? (activeSession.userId?.name || "User") : (activeSession.personaId?.name || "Companion")}
                          </span>
                          {msg.inputSource && msg.inputSource !== "text" && (
                            <span className="bg-white/10 text-white/70 px-1.5 py-0.2 rounded text-[9px]">
                              {msg.inputSource}
                            </span>
                          )}
                          <span>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            isUser
                              ? "bg-gradient-to-tr from-pink-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-pink-600/20"
                              : "bg-[#1B1733] border border-white/10 text-white/90 rounded-tl-none shadow-lg"
                          }`}
                        >
                          {msg.content}
                          {msg.reaction && (
                            <span className="inline-block ml-2 text-sm">{msg.reaction}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-white/40 text-xs">
                  This conversation thread has no messages yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-[#161329] flex items-center justify-between">
              <button
                onClick={() => handleDeleteConversation(activeSession._id)}
                className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Entire Thread
              </button>
              <button
                onClick={() => setActiveSession(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold transition"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE USER DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161329] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Delete User & Related Data?</h3>
                <p className="text-xs text-white/50">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-[#0E0C1C] border border-white/5 rounded-xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-white/40">User Name:</span>
                <span className="font-semibold text-white">{userToDelete.name || "Anonymous User"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Email:</span>
                <span className="text-white">{userToDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Subscription:</span>
                <span className="uppercase font-semibold text-pink-400">{userToDelete.subscriptionTier || "free"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">User ID:</span>
                <span className="font-mono text-[10px] text-white/60">{userToDelete._id}</span>
              </div>
            </div>

            <p className="text-xs text-red-300/90 leading-relaxed bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              ⚠️ Deleting this user will permanently erase their profile, all AI conversation threads, messages, voice logs, custom companion configs, and subscriptions.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteSingleUser}
                disabled={isDeletingUser}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-red-600/30 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isDeletingUser ? "Deleting..." : "Permanently Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK DELETE ALL USERS CONFIRMATION MODAL */}
      {isDeleteAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181022] border-2 border-red-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-400">DANGER ZONE: Wipe All Users</h3>
                <p className="text-xs text-white/50">Bulk purge non-admin user directory & conversation history</p>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-white/80 space-y-2 leading-relaxed">
              <p className="font-semibold text-red-300">
                You are about to delete ALL non-admin users and every related record across the entire platform:
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/70 pl-1 text-[11px]">
                <li>All user accounts, profiles, and credentials</li>
                <li>All AI chat sessions, messages, and dialogue transcripts</li>
                <li>All voice session metadata and call history</li>
                <li>All user custom partner configurations and preferences</li>
                <li>All subscriptions, notifications, and support tickets</li>
              </ul>
              <p className="text-[11px] text-emerald-400 pt-1">
                ✓ Active admin accounts are protected and will NOT be deleted.
              </p>
            </div>

            <form onSubmit={handleDeleteAllUsers} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Type <span className="font-mono text-red-400 select-all font-bold">DELETE ALL USERS</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteAllConfirmText}
                  onChange={(e) => setDeleteAllConfirmText(e.target.value)}
                  placeholder="DELETE ALL USERS"
                  className="w-full bg-[#0E0C1C] border border-red-500/40 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteAllModalOpen(false);
                    setDeleteAllConfirmText("");
                  }}
                  disabled={isDeletingAll}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteAllConfirmText !== "DELETE ALL USERS" || isDeletingAll}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {isDeletingAll ? "Wiping Database..." : "Confirm & Delete All Users"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NOTIFICATION RECIPIENTS INSPECT MODAL ("WHO GOT NOTIFICATION") */}
      {recipientModalOpen && selectedNotification && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
          <div className="bg-[#141126] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-[#161329] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                    <Bell className="w-4 h-4" />
                  </span>
                  <h3 className="font-bold text-base text-white truncate">
                    {selectedNotification.title}
                  </h3>
                </div>
                <p className="text-xs text-white/50 mt-1 line-clamp-1">
                  "{selectedNotification.body}" • Dispatched {new Date(selectedNotification.sentAt || selectedNotification.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    ✓ {selectedNotification.stats?.sent ?? 0} Delivered
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                    ✕ {selectedNotification.stats?.failed ?? 0} Failed
                  </span>
                </div>
                <button
                  onClick={() => {
                    setRecipientModalOpen(false);
                    setSelectedNotification(null);
                    setRecipientsList([]);
                  }}
                  className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-white/5 bg-[#0E0C1C] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search recipient by name, email, token..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="w-full bg-[#161329] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {[
                  { id: "all", label: "All" },
                  { id: "delivered", label: "Delivered" },
                  { id: "failed", label: "Failed" },
                  { id: "no_token", label: "No Token" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRecipientStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      recipientStatusFilter === f.id
                        ? "bg-pink-500/20 border-pink-500/40 text-pink-400"
                        : "bg-white/5 border-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients List Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {recipientsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/50 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
                  Fetching recipient delivery logs...
                </div>
              ) : (
                (() => {
                  const filtered = recipientsList.filter((r) => {
                    const matchStatus =
                      recipientStatusFilter === "all" || r.status === recipientStatusFilter;
                    const q = recipientSearch.toLowerCase().trim();
                    const matchQuery =
                      !q ||
                      (r.name && r.name.toLowerCase().includes(q)) ||
                      (r.email && r.email.toLowerCase().includes(q)) ||
                      (r.deviceToken && r.deviceToken.toLowerCase().includes(q));
                    return matchStatus && matchQuery;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-white/40 text-xs">
                        No recipient logs match your filter criteria.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-white/5 text-white/40 font-semibold">
                            <th className="pb-3 pr-4">User</th>
                            <th className="pb-3 px-4">Email</th>
                            <th className="pb-3 px-4">Device Token</th>
                            <th className="pb-3 px-4">Status</th>
                            <th className="pb-3 pl-4 text-right">Delivered At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filtered.map((r, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition">
                              <td className="py-3 pr-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden shrink-0">
                                    {r.avatarUrl ? (
                                      <img src={r.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      (r.name || "U")[0]
                                    )}
                                  </div>
                                  <span className="font-semibold text-white/90 truncate max-w-[140px]">
                                    {r.name || "Anonymous User"}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-white/70 whitespace-nowrap">
                                {r.email || "No Email"}
                              </td>

                              <td className="py-3 px-4 text-white/40 font-mono text-[10px] whitespace-nowrap">
                                {r.deviceToken ? `${r.deviceToken.slice(0, 16)}...` : "None"}
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                {r.status === "delivered" ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3" /> Delivered
                                  </span>
                                ) : r.status === "failed" ? (
                                  <span
                                    title={r.error}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 cursor-help"
                                  >
                                    <XCircle className="w-3 h-3" /> Failed
                                  </span>
                                ) : (
                                  <span
                                    title={r.error || "No active token registered"}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-500/15 text-gray-400 border border-gray-500/30 cursor-help"
                                  >
                                    No Token
                                  </span>
                                )}
                              </td>

                              <td className="py-3 pl-4 text-right text-white/50 text-[11px] whitespace-nowrap">
                                {r.deliveredAt ? new Date(r.deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}

              {/* Recipients Pagination */}
              {recipientTotalPages > 1 && (
                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span>
                    Page <strong className="text-white">{recipientPage}</strong> of{" "}
                    <strong className="text-white">{recipientTotalPages}</strong> ({recipientTotal} recipients)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={recipientPage <= 1}
                      onClick={() => {
                        const nextP = Math.max(1, recipientPage - 1);
                        setRecipientPage(nextP);
                        fetchRecipients(selectedNotification._id, nextP);
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded flex items-center gap-1"
                    >
                      <ChevronLeft className="w-3 h-3" /> Prev
                    </button>
                    <button
                      disabled={recipientPage >= recipientTotalPages}
                      onClick={() => {
                        const nextP = Math.min(recipientTotalPages, recipientPage + 1);
                        setRecipientPage(nextP);
                        fetchRecipients(selectedNotification._id, nextP);
                      }}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 disabled:opacity-40 rounded flex items-center gap-1"
                    >
                      Next <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AD LOG MEDIATION INSPECTOR MODAL */}
      {isAdLogModalOpen && selectedAdLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161329] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-purple-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    Ad Mediation Telemetry Inspector
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        selectedAdLog.eventType?.includes("failed")
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : selectedAdLog.eventType === "not_ready_fallback"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      }`}
                    >
                      {selectedAdLog.eventType}
                    </span>
                  </h3>
                  <p className="text-xs text-white/40">
                    Logged at {new Date(selectedAdLog.createdAt).toLocaleString()} • ID: {selectedAdLog._id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdLogModalOpen(false);
                  setSelectedAdLog(null);
                }}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/40 block mb-1">Provider</span>
                  <span className="font-semibold text-white">
                    {selectedAdLog.provider || "Google AdMob"}
                  </span>
                </div>
                <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/40 block mb-1">Ad Format</span>
                  <span className="font-semibold text-white">{selectedAdLog.adType}</span>
                </div>
                <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/40 block mb-1">Placement</span>
                  <span className="font-semibold text-white font-mono">
                    {selectedAdLog.placement || "default"}
                  </span>
                </div>
                <div className="bg-[#0E0C1C] p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-white/40 block mb-1">Device / OS</span>
                  <span className="font-semibold text-white">
                    {selectedAdLog.platform || "android"} {selectedAdLog.deviceModel ? `(${selectedAdLog.deviceModel})` : ""}
                  </span>
                </div>
              </div>

              {/* User Context */}
              <div className="bg-[#0E0C1C] p-3.5 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-white/40 block">User Context</span>
                  <span className="font-medium text-white/90">
                    {selectedAdLog.userName || "Guest"} ({selectedAdLog.userEmail || "No Email"})
                  </span>
                </div>
                <span className="font-mono text-[10px] text-white/40">
                  User ID: {selectedAdLog.userId || "anonymous"}
                </span>
              </div>

              {/* Error Diagnostics Banner (if failed) */}
              {(selectedAdLog.errorCode !== undefined && selectedAdLog.errorCode !== null) && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold font-mono text-[11px]">
                      Error Code {selectedAdLog.errorCode}
                    </span>
                    <span className="text-rose-300 font-semibold text-xs">
                      {selectedAdLog.errorCode === 3
                        ? "ERROR_CODE_NO_FILL (No ad inventory returned by Google/Meta bidding)"
                        : selectedAdLog.errorCode === 1
                        ? "ERROR_CODE_INVALID_REQUEST (Invalid ad unit ID or placement configuration)"
                        : selectedAdLog.errorCode === 2
                        ? "ERROR_CODE_NETWORK_ERROR (Network connection failed)"
                        : selectedAdLog.errorCode === 0
                        ? "ERROR_CODE_INTERNAL_ERROR (Internal SDK error)"
                        : "Ad Mediation Failure"}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/80 space-y-1">
                    <div>
                      <strong className="text-white/50 font-normal">Domain: </strong>
                      <span className="font-mono">{selectedAdLog.errorDomain || "com.google.android.gms.ads"}</span>
                    </div>
                    <div>
                      <strong className="text-white/50 font-normal">Message: </strong>
                      <span>{selectedAdLog.errorMessage || "No description"}</span>
                    </div>
                    <div>
                      <strong className="text-white/50 font-normal">Unit ID: </strong>
                      <span className="font-mono text-[10px]">{selectedAdLog.adUnitId || "None"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mediation Adapter Responses (Meta Audience Network vs Google AdMob waterfall) */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-white/80 flex items-center justify-between">
                  <span>Mediation Adapter Waterfall Responses</span>
                  <span className="text-[10px] text-white/40">
                    {selectedAdLog.mediationResponses?.length || 0} adapter(s) evaluated
                  </span>
                </h4>

                {selectedAdLog.mediationResponses && selectedAdLog.mediationResponses.length > 0 ? (
                  <div className="space-y-2">
                    {selectedAdLog.mediationResponses.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-[#0E0C1C] border border-white/5 rounded-xl p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-semibold text-white/90 text-[11px]">
                            {item.adapterClassName || "Unknown Adapter"}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-white/60 font-mono">
                            {item.latencyMillis ? `${item.latencyMillis} ms` : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-white/50">
                          <span>Ad Source: <strong className="text-white/70">{item.adSourceName || "None"}</strong></span>
                          {item.adSourceId && <span>ID: <strong className="text-white/70">{item.adSourceId}</strong></span>}
                        </div>
                        {item.adError && (
                          <div className="mt-2 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-300 font-mono">
                            Error {item.adError.code} ({item.adError.domain}): {item.adError.message}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#0E0C1C] border border-white/5 rounded-xl p-4 text-center text-white/40 text-[11px]">
                    No mediation adapter breakdown attached. (Pre-flight request or direct SDK event)
                  </div>
                )}
              </div>

              {/* Raw JSON Debug Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white/70 text-[11px]">Raw Telemetry JSON</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedAdLog, null, 2));
                      showToast("Telemetry JSON copied to clipboard");
                    }}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-white/60 hover:text-white transition"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="p-3 bg-[#080611] border border-white/5 rounded-xl font-mono text-[10px] text-white/60 max-h-48 overflow-y-auto">
                  {JSON.stringify(selectedAdLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/5 flex justify-end">
              <button
                onClick={() => {
                  setIsAdLogModalOpen(false);
                  setSelectedAdLog(null);
                }}
                className="px-5 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-semibold text-white transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
