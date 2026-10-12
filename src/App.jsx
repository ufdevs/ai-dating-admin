import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Tv,
  Wallet,
  Activity,
  FileText,
  CheckCircle,
  XCircle,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings,
  LogOut,
  Shield,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Info,
  Coins,
  Ban,
  Gift,
  Smartphone,
  Sparkles,
  Radio,
  Bell,
  PlusCircle,
  Edit3,
  ExternalLink,
  Play,
  Video,
  Image,
  X,
  Plus,
  Lock,
  Bot,
  Key,
  EyeOff,
  Save,
  CreditCard,
  Cpu
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
  Legend
} from "recharts";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem("admin_base_url") || "https://api.uff.ufdevs.live/api/v2");

  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // App navigation state
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard Stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalPendingApplications: 0,
    totalLiveStreams: 0,
    totalPlatformFeeCoins: 0,
    totalEarningsCoins: 0,
    totalWithdrawableCoins: 0,
  });

  // Data states
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Pagination and Filters
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");

  const [hostPage, setHostPage] = useState(1);
  const [hostTotalPages, setHostTotalPages] = useState(1);

  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txType, setTxType] = useState("");
  const [txCategory, setTxCategory] = useState("");
  const [txLedger, setTxLedger] = useState("wallet");

  // Moderation, streams, and configuration states
  const [streams, setStreams] = useState([]);
  const [streamPage, setStreamPage] = useState(1);
  const [streamTotalPages, setStreamTotalPages] = useState(1);

  const [helpRequests, setHelpRequests] = useState([]);
  const [helpPage, setHelpPage] = useState(1);
  const [helpTotalPages, setHelpTotalPages] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const [reports, setReports] = useState([]);
  const [reportPage, setReportPage] = useState(1);
  const [reportTotalPages, setReportTotalPages] = useState(1);

  const [blocks, setBlocks] = useState([]);
  const [blockPage, setBlockPage] = useState(1);
  const [blockTotalPages, setBlockTotalPages] = useState(1);

  const [sysConfig, setSysConfig] = useState({
    activeLiveStreamProvider: "agora",
    activePaymentGateway: "cashfree",
    agoraAppId: "",
    agoraAppCertificate: "",
    livekitUrl: "",
    livekitApiKey: "",
    livekitApiSecret: "",
    razorpayKeyId: "",
    razorpayKeySecret: "",
    cashfreeClientId: "",
    cashfreeClientSecret: "",
    cashfreeEnvironment: "sandbox",
    cashfreePayoutClientId: "",
    cashfreePayoutClientSecret: "",
    cashfreePayoutEnvironment: "sandbox",
    platformFeePercent: 30,
    // AdMob settings
    admobEnabled: true,
    admobAppId: "ca-app-pub-6432996956966947~4544179348",
    admobRewardedInterstitialAdUnitId: "ca-app-pub-6432996956966947/7610249820",
    admobRewardedAdUnitId: "ca-app-pub-6432996956966947/7610249820",
    adRewardCoins: 10,
    // OTA Force Update
    forceUpdate: false,
    minAppVersion: "1.0.0",
    latestAppVersion: "1.0.0",
    updateUrl: "https://play.google.com/store/apps/details?id=in.ufdevs.crowdcast",
    updateMessage: "A newer version of CrowdCast is available with improved streaming & performance. Please update now!",
    // Offer / Promo Banner
    offerBanner: {
      enabled: false,
      title: "🎁 Exclusive Bonus Coins Offer!",
      description: "Recharge now and get up to 50% extra free coins on your next pack.",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
      actionType: "wallet",
      actionUrl: "/wallet",
      targetUserId: "",
      isGlobal: true,
    },
    // AI Chat & OpenRouter Settings
    openRouterApiKey: "",
    openRouterModel: "meta-llama/llama-3.3-70b-instruct",
    openRouterFallbackModels: "google/gemma-4-31b-it:free, nvidia/nemotron-3.5-lightning:free, liquid/lfm-2.5-2.6b:free, apodex/apodex-1.1-mini:free",
    aiFreeMessagesQuota: 5,
    aiCoinsPerMessage: 5,
  });

  const [configSubTab, setConfigSubTab] = useState("ai");
  const [showApiKey, setShowApiKey] = useState(false);

  const [notifTarget, setNotifTarget] = useState("all");
  const [notifUserId, setNotifUserId] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");

  // Modals / Details states
  const [selectedApp, setSelectedApp] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [customPlatformFee, setCustomPlatformFee] = useState(30);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // User Coin Grant Modal
  const [showCoinModal, setShowCoinModal] = useState(false);
  const [selectedUserForCoins, setSelectedUserForCoins] = useState(null);
  const [coinAmount, setCoinAmount] = useState("");
  const [coinReason, setCoinReason] = useState("Admin Bonus");
  const [coinCustomMessage, setCoinCustomMessage] = useState("");

  // Host Creation & Multi-Host Simulated Live Stream States
  const [allHostsList, setAllHostsList] = useState([]);
  const [showCreateHostModal, setShowCreateHostModal] = useState(false);
  const [galleryInputUrl, setGalleryInputUrl] = useState("");
  const [createHostForm, setCreateHostForm] = useState({
    name: "",
    email: "",
    profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
    bio: "Official CrowdCast Creator",
    gender: "female",
    country: "India",
    category: "General",
    coinBalance: 0,
    platformFeePercent: 30,
    photos: [],
    aiPersona: "Flirty, sweet, playful, affectionate, charming and romantic companion who loves flirting, compliments, and playful conversations.",
    mediaBundles: []
  });

  // Edit User / Host Profile State
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    _id: "",
    name: "",
    email: "",
    profilePhoto: "",
    bio: "",
    gender: "female",
    country: "India",
    role: "user",
    hostApplicationStatus: "approved",
    coinBalance: 0,
    isBlocked: false,
    photos: [],
    aiPersona: "Flirty, sweet, playful, affectionate, charming and romantic companion who loves flirting, compliments, and playful conversations.",
    mediaBundles: []
  });

  // Photo/Video Bundle State for Modals
  const [newBundleForm, setNewBundleForm] = useState({
    title: "",
    type: "photos",
    demoMediaUrl: "",
    mediaItemsText: "",
    priceRupees: 49,
    productId: "bundle_exclusive_49"
  });
  const [showAddBundleForm, setShowAddBundleForm] = useState(false);

  // Launch Live Stream Modal State (YouTube Shorts / Video URL / LiveKit)
  const [showLaunchStreamModal, setShowLaunchStreamModal] = useState(false);
  const [launchStreamForm, setLaunchStreamForm] = useState({
    hostId: "",
    title: "",
    description: "",
    streamSourceType: "youtube",
    streamUrl: "",
    category: "General"
  });

  // Global loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchDashboardStats();
      if (activeTab === "applications") fetchApplications();
      if (activeTab === "users") fetchUsers();
      if (activeTab === "hosts") fetchHosts();
      if (activeTab === "transactions") fetchTransactions();
      if (activeTab === "streams") fetchStreams();
      if (activeTab === "support") fetchHelpRequests();
      if (activeTab === "reports") {
        fetchReports();
        fetchBlocks();
      }
      if (activeTab === "config") fetchSystemConfig();
    }
  }, [isLoggedIn, activeTab, userPage, hostPage, txPage, txType, txCategory, txLedger, streamPage, helpPage, reportPage, blockPage]);

  // Debounced search for users
  useEffect(() => {
    if (isLoggedIn && activeTab === "users") {
      const timer = setTimeout(() => {
        fetchUsers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userSearch]);

  const getAxiosConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthLoading(true);
    try {
      // First attempt Firebase verify with endpoint
      const response = await axios.post(`${baseUrl}/auth/verify`, {
        email,
        phoneNumber: "",
        idToken: "admin_" + Date.now(),
        deviceId: "admin_panel",
        deviceInfo: { platform: "web", model: "Admin Dashboard" }
      });

      const user = response.data?.data?.user;
      const accessToken = response.data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("No token returned from server");
      }

      if (user?.role !== "admin") {
        // If roles is not admin, we force toggle role to admin for testing, or fail
        // To make development robust, if admin user is not in db yet we let them know
        throw new Error("Access Denied: This account does not have administrator privileges.");
      }

      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem("admin_base_url", baseUrl);
      setToken(accessToken);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.message;
      setAuthError(serverMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleBypassLogin = () => {
    // Allows admin to manually supply a token if they generated it elsewhere
    const manuallyEnteredToken = prompt("Enter Admin JWT token manually:");
    if (manuallyEnteredToken) {
      localStorage.setItem("admin_token", manuallyEnteredToken);
      localStorage.setItem("admin_base_url", baseUrl);
      setToken(manuallyEnteredToken);
      setIsLoggedIn(true);
      setAuthError("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLoggedIn(false);
    setActiveTab("dashboard");
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get(`${baseUrl}/admin/dashboard-stats`, getAxiosConfig());
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/host-applications`, getAxiosConfig());
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/admin/users?page=${userPage}&limit=10&search=${userSearch}`,
        getAxiosConfig()
      );
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
        setUserTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/admin/hosts?page=${hostPage}&limit=10`,
        getAxiosConfig()
      );
      if (res.data?.success) {
        setHosts(res.data.data.hosts || []);
        setHostTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHostsList = async () => {
    try {
      const res = await axios.get(`${baseUrl}/admin/hosts/all`, getAxiosConfig());
      if (res.data?.success) {
        setAllHostsList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHost = async (e) => {
    e?.preventDefault();
    if (!createHostForm.name.trim()) return alert("Host name is required");
    setActionLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/admin/hosts/create`, createHostForm, getAxiosConfig());
      if (res.data?.success) {
        alert("Host created successfully!");
        setShowCreateHostModal(false);
        setCreateHostForm({
          name: "",
          email: "",
          profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
          bio: "Official CrowdCast Creator",
          gender: "female",
          country: "India",
          category: "General",
          coinBalance: 0,
          platformFeePercent: 30
        });
        fetchHosts();
        fetchAllHostsList();
        fetchDashboardStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditUser = (userObj) => {
    const photos = userObj.photos || userObj.galleryPhotos || userObj.profile?.photos || [];
    const aiPersona = userObj.aiPersona || userObj.profile?.aiPersona || "Flirty, sweet, playful, affectionate, charming and romantic companion who loves flirting, compliments, and playful conversations.";
    const mediaBundles = userObj.mediaBundles || userObj.profile?.mediaBundles || [];
    setGalleryInputUrl("");
    setShowAddBundleForm(false);
    setEditUserForm({
      _id: userObj._id,
      name: userObj.name || "",
      email: userObj.email || "",
      profilePhoto: userObj.profilePhoto || "",
      bio: userObj.bio || "",
      gender: userObj.gender || "female",
      country: userObj.country || "India",
      role: userObj.role || "user",
      hostApplicationStatus: userObj.hostApplicationStatus || "approved",
      coinBalance: userObj.coinBalance ?? 0,
      isBlocked: !!userObj.isBlocked,
      photos: Array.isArray(photos) ? [...photos] : [],
      aiPersona,
      mediaBundles: Array.isArray(mediaBundles) ? [...mediaBundles] : []
    });
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = async (e) => {
    e?.preventDefault();
    if (!editUserForm._id) return;
    setActionLoading(true);
    try {
      const res = await axios.put(`${baseUrl}/admin/users/${editUserForm._id}`, editUserForm, getAxiosConfig());
      if (res.data?.success) {
        alert("User profile updated successfully!");
        setShowEditUserModal(false);
        if (activeTab === "users") fetchUsers();
        if (activeTab === "hosts") fetchHosts();
        fetchAllHostsList();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenLaunchStream = (preselectedHostId = "") => {
    fetchAllHostsList();
    setLaunchStreamForm({
      hostId: preselectedHostId || (allHostsList.length > 0 ? allHostsList[0]._id : ""),
      title: "🔴 Live Vibes & Fun Chat!",
      description: "Join me live for interactive fun, games and real-time chat!",
      streamSourceType: "youtube",
      streamUrl: "",
      category: "General"
    });
    setShowLaunchStreamModal(true);
  };

  const handleStartSimulatedStream = async (e) => {
    e?.preventDefault();
    if (!launchStreamForm.hostId) return alert("Please select a Host");
    if (!launchStreamForm.title.trim()) return alert("Stream Title is required");
    if (!launchStreamForm.streamUrl.trim() && (launchStreamForm.streamSourceType === "youtube" || launchStreamForm.streamSourceType === "video_url")) {
      return alert("Stream URL / YouTube Shorts URL is required");
    }
    setActionLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/admin/streams/start-simulated`, launchStreamForm, getAxiosConfig());
      if (res.data?.success) {
        alert("Live Stream successfully launched for host!");
        setShowLaunchStreamModal(false);
        if (activeTab === "streams") fetchStreams();
        if (activeTab === "hosts") fetchHosts();
        fetchDashboardStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `${baseUrl}/admin/transactions?page=${txPage}&limit=10&ledger=${txLedger}`;
      if (txType) url += `&type=${txType}`;
      if (txCategory) url += `&category=${txCategory}`;

      const res = await axios.get(url, getAxiosConfig());
      if (res.data?.success) {
        setTransactions(res.data.data.transactions || []);
        setTxTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async () => {
    setActionLoading(true);
    try {
      const body = {
        status: reviewStatus,
        platformFeePercent: reviewStatus === "approved" ? customPlatformFee : undefined,
        rejectionReason: reviewStatus === "rejected" ? rejectionReason : undefined,
      };

      const res = await axios.post(
        `${baseUrl}/admin/host-applications/${selectedApp._id}/review`,
        body,
        getAxiosConfig()
      );

      if (res.data?.success) {
        alert(`Application successfully ${reviewStatus}!`);
        setShowReviewModal(false);
        setSelectedApp(null);
        setRejectionReason("");
        fetchApplications();
        fetchDashboardStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/streams?page=${streamPage}&limit=10`, getAxiosConfig());
      if (res.data?.success) {
        setStreams(res.data.data.streams || []);
        setStreamTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndStream = async (streamId) => {
    if (!confirm("Are you sure you want to end this stream?")) return;
    try {
      const res = await axios.post(`${baseUrl}/admin/streams/${streamId}/end`, {}, getAxiosConfig());
      if (res.data?.success) {
        alert("Stream ended successfully!");
        fetchStreams();
        fetchDashboardStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const fetchHelpRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/help-requests?page=${helpPage}&limit=10`, getAxiosConfig());
      if (res.data?.success) {
        setHelpRequests(res.data.data.helpRequests || []);
        setHelpTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyTicket = async () => {
    if (!replyMessage.trim()) return alert("Please enter a reply message");
    setActionLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/admin/help-requests/${selectedTicket._id}/reply`, { replyMessage }, getAxiosConfig());
      if (res.data?.success) {
        alert("Reply sent successfully!");
        setShowReplyModal(false);
        setReplyMessage("");
        setSelectedTicket(null);
        fetchHelpRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/reports?page=${reportPage}&limit=10`, getAxiosConfig());
      if (res.data?.success) {
        setReports(res.data.data.reports || []);
        setReportTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      const res = await axios.post(`${baseUrl}/admin/reports/${reportId}/review`, { status }, getAxiosConfig());
      if (res.data?.success) {
        alert(`Report marked as ${status}`);
        fetchReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/blocks?page=${blockPage}&limit=10`, getAxiosConfig());
      if (res.data?.success) {
        setBlocks(res.data.data.blocks || []);
        setBlockTotalPages(res.data.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCoins = async (e) => {
    e.preventDefault();
    if (!selectedUserForCoins || !coinAmount) return;
    setActionLoading(true);
    try {
      const res = await axios.post(
        `${baseUrl}/admin/users/${selectedUserForCoins._id}/coins`,
        {
          amount: Number(coinAmount),
          reason: coinReason || "Admin Bonus",
          customMessage: coinCustomMessage || `You have received ${coinAmount} bonus coins!`,
        },
        getAxiosConfig()
      );
      if (res.data?.success) {
        alert(res.data.message || `Successfully added ${coinAmount} coins!`);
        setShowCoinModal(false);
        setCoinAmount("");
        setCoinReason("Admin Bonus");
        setCoinCustomMessage("");
        setSelectedUserForCoins(null);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleBlock = async (user) => {
    const isBlocking = !user.isBlocked;
    const confirmMsg = isBlocking
      ? `Are you sure you want to BLOCK ${user.name || "this user"}? They will be immediately disconnected from any streams or calls.`
      : `Unblock ${user.name || "this user"}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.post(
        `${baseUrl}/admin/users/${user._id}/toggle-block`,
        { isBlocked: isBlocking, reason: isBlocking ? "Account suspended by Administrator" : "" },
        getAxiosConfig()
      );
      if (res.data?.success) {
        alert(res.data.message || `User status updated successfully!`);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const fetchSystemConfig = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/admin/system-config`, getAxiosConfig());
      if (res.data?.success) {
        setSysConfig(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/admin/system-config`, sysConfig, getAxiosConfig());
      if (res.data?.success) {
        alert("System configuration updated successfully!");
        setSysConfig(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) return alert("Title and body are required");
    setActionLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/admin/notifications/send`, {
        target: notifTarget,
        userId: notifTarget === "individual" ? notifUserId : undefined,
        title: notifTitle,
        body: notifBody
      }, getAxiosConfig());
      if (res.data?.success) {
        alert("Broadcast notification successfully sent!");
        setNotifTitle("");
        setNotifBody("");
        setNotifUserId("");
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHostPayout = async (hostId, coins) => {
    const amountINR = Math.round(coins * 0.10 * 100) / 100;
    if (!confirm(`Are you sure you want to process a payout of ${coins} coins (₹${amountINR}) to this host?`)) return;
    setActionLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/admin/hosts/${hostId}/payout`, {}, getAxiosConfig());
      if (res.data?.success) {
        alert(`Payout successfully processed! Transfer ID: ${res.data.data.cfTransferId || res.data.data.transferId}`);
        fetchHosts();
        fetchDashboardStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Dummy visual data based on actual stats for charts
  const getRevenueChartData = () => {
    return [
      { name: "Mon", revenue: Math.floor(stats.totalPlatformFeeCoins * 0.1) },
      { name: "Tue", revenue: Math.floor(stats.totalPlatformFeeCoins * 0.15) },
      { name: "Wed", revenue: Math.floor(stats.totalPlatformFeeCoins * 0.22) },
      { name: "Thu", revenue: Math.floor(stats.totalPlatformFeeCoins * 0.4) },
      { name: "Fri", revenue: Math.floor(stats.totalPlatformFeeCoins * 0.6) },
      { name: "Sat", revenue: Math.floor(stats.totalPlatformFeeCoins * 0.8) },
      { name: "Sun", revenue: stats.totalPlatformFeeCoins },
    ];
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F0C20] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161230] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/20 p-4 rounded-full border border-primary/40">
              <Shield className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2">CrowdCast Admin Portal</h2>
          <p className="text-sm text-white/50 text-center mb-8">Manage broadcasters, review applications, and audit wallet activity.</p>

          {authError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mb-6 text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">API Base URL</label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mingle.com"
                className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isAuthLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50"
            >
              {isAuthLoading ? "Verifying Credentials..." : "LOG IN"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#161230] px-2 text-white/40">Or Dev Override</span></div>
          </div>

          <button
            onClick={handleBypassLogin}
            className="w-full bg-white/5 border border-white/10 text-white/70 font-semibold py-2.5 px-4 rounded-xl hover:bg-white/10 transition"
          >
            Direct Token Auth Bypass
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0C20] text-white flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#161230] border-r border-white/10 flex flex-col">
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CROWDCAST</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "dashboard" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Activity className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "applications" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <span>Applications</span>
            </div>
            {stats.totalPendingApplications > 0 && (
              <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.totalPendingApplications}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "users" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Users className="h-5 w-5" />
            <span>Broadcasters (Users)</span>
          </button>
          <button
            onClick={() => setActiveTab("hosts")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "hosts" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Tv className="h-5 w-5" />
            <span>Approved Hosts</span>
          </button>
           <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "transactions" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Wallet className="h-5 w-5" />
            <span>Wallet Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab("streams")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "streams" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Tv className="h-5 w-5" />
            <span>Live Streams</span>
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "support" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <FileText className="h-5 w-5" />
            <span>Support Requests</span>
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "reports" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Shield className="h-5 w-5" />
            <span>Reports & Blocks</span>
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "notifications" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Layers className="h-5 w-5" />
            <span>Notifications</span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition ${activeTab === "config" ? "bg-primary text-white" : "text-white/60 hover:bg-white/5"
              }`}
          >
            <Settings className="h-5 w-5" />
            <span>System Config</span>
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-2 py-3 mb-3 bg-[#0F0C20] rounded-xl border border-white/5">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center font-bold text-sm">
              AD
            </div>
            <div className="truncate">
              <p className="text-xs font-bold">Admin Manager</p>
              <p className="text-[10px] text-white/40 truncate">v2 Server Active</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#161230] border-b border-white/10 flex items-center justify-between px-8">
          <h1 className="text-lg font-bold capitalize">{activeTab} Manager</h1>
          <div className="flex items-center space-x-4">
            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full flex items-center space-x-1.5 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>API Connect Active</span>
            </span>
          </div>
        </header>

        {/* Views */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/50">Total Broadcasters</span>
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-extrabold">{stats.totalUsers + stats.totalHosts}</h3>
                  <p className="text-xs text-white/40 mt-1">Users register on app</p>
                </div>
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/50">Broadcasting Hosts</span>
                    <Tv className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-3xl font-extrabold">{stats.totalHosts}</h3>
                  <p className="text-xs text-emerald-400 mt-1">Active verified broadcasters</p>
                </div>
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/50">Pending Applications</span>
                    <FileText className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-amber-500">{stats.totalPendingApplications}</h3>
                  <p className="text-xs text-white/40 mt-1">Require document audit</p>
                </div>
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/50">Platform Revenue (Coins)</span>
                    <DollarSign className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-emerald-400">{stats.totalPlatformFeeCoins}</h3>
                  <p className="text-xs text-white/40 mt-1">30% revenue share total</p>
                </div>
              </div>

              {/* Chart Block */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-lg lg:col-span-2">
                  <h3 className="text-lg font-bold mb-6">Platform Fee Coin Earnings (Running Total)</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getRevenueChartData()}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF007F" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF007F" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="name" stroke="#ffffff50" />
                        <YAxis stroke="#ffffff50" />
                        <Tooltip contentStyle={{ backgroundColor: "#161230", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <Area type="monotone" dataKey="revenue" stroke="#FF007F" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Earning Breakdown</h3>
                    <p className="text-xs text-white/40 mb-6">Aggregate balance details across all creator hosts on CrowdCast.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-xs text-white/60 mb-2">
                        <span>Total Host Earnings</span>
                        <span>{stats.totalEarningsCoins} coins</span>
                      </div>
                      <div className="w-full bg-[#0F0C20] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${stats.totalEarningsCoins > 0 ? (stats.totalEarningsCoins / (stats.totalEarningsCoins + stats.totalPlatformFeeCoins)) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-white/60 mb-2">
                        <span>Platform Fee Share (30%)</span>
                        <span>{stats.totalPlatformFeeCoins} coins</span>
                      </div>
                      <div className="w-full bg-[#0F0C20] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: `${stats.totalPlatformFeeCoins > 0 ? (stats.totalPlatformFeeCoins / (stats.totalEarningsCoins + stats.totalPlatformFeeCoins)) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-white/60 mb-2">
                        <span>Withdrawable Balance</span>
                        <span>{stats.totalWithdrawableCoins} coins</span>
                      </div>
                      <div className="w-full bg-[#0F0C20] h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${stats.totalEarningsCoins > 0 ? (stats.totalWithdrawableCoins / stats.totalEarningsCoins) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 text-center text-xs text-white/30 border-t border-white/5 pt-4">
                    Audit updated in real-time via db hooks
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
              ) : applications.length === 0 ? (
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-12 text-center text-white/50">
                  <FileText className="h-12 w-12 mx-auto text-white/20 mb-4" />
                  No host application requests found at this time.
                </div>
              ) : (
                <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                          <th className="px-6 py-4">Applicant</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Submitted Date</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {applications.map((app) => (
                          <tr key={app._id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={app.userId?.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                  <div className="font-bold text-white">{app.userId?.name || "Unnamed"}</div>
                                  <div className="text-xs text-white/50">{app.userId?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-white">{app.city}, {app.state}</div>
                              <div className="text-xs text-white/50">{app.country}</div>
                            </td>
                            <td className="px-6 py-4 text-white/70">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${app.status === "pending"
                                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                                  : app.status === "approved"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                                }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/10 transition inline-flex items-center space-x-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Audit Documents</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center bg-[#161230] border border-white/10 rounded-xl px-4 py-2 w-full max-w-md">
                <Search className="h-5 w-5 text-white/40 mr-3" />
                <input
                  type="text"
                  placeholder="Search users by name, email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="bg-transparent text-white w-full text-sm focus:outline-none"
                />
              </div>

              {loading && users.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
              ) : users.length === 0 ? (
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-12 text-center text-white/50">
                  No users found matching query.
                </div>
              ) : (
                <>
                  <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Application State</th>
                          <th className="px-6 py-4">Wallet Balance</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Joined Date</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={user.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                  <div className="font-bold text-white">{user.name || "Unnamed User"}</div>
                                  <div className="text-xs text-white/50">{user.email || user.phoneNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white font-medium capitalize">
                              {user.role}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.hostApplicationStatus === 'pending'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                                  : user.hostApplicationStatus === 'rejected'
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                                    : user.hostApplicationStatus === 'approved'
                                      ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                                      : 'bg-white/5 text-white/40'
                                }`}>
                                {user.hostApplicationStatus || 'none'}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-400">
                              {user.coinBalance} coins
                            </td>
                            <td className="px-6 py-4">
                              {user.isBlocked ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40">
                                  Blocked
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-white/60">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleOpenEditUser(user)}
                                  className="bg-white/5 text-white/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/10 transition flex items-center space-x-1"
                                  title="Edit User Profile, Avatar & Roles"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedUserForCoins(user);
                                    setCoinAmount("100");
                                    setCoinCustomMessage(`🎉 You received 100 free coins from CrowdCast!`);
                                    setShowCoinModal(true);
                                  }}
                                  className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-amber-500/30 transition flex items-center space-x-1"
                                  title="Add coins with push notification"
                                >
                                  <Coins className="h-3.5 w-3.5" />
                                  <span>Add Coins</span>
                                </button>
                                <button
                                  onClick={() => handleToggleBlock(user)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center space-x-1 ${
                                    user.isBlocked
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                                      : "bg-red-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30"
                                  }`}
                                  title={user.isBlocked ? "Unblock user" : "Block user"}
                                >
                                  {user.isBlocked ? <Shield className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                                  <span>{user.isBlocked ? "Unblock" : "Block"}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control */}
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-white/50">Page {userPage} of {userTotalPages}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setUserPage(p => Math.max(p - 1, 1))}
                        disabled={userPage === 1}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setUserPage(p => Math.min(p + 1, userTotalPages))}
                        disabled={userPage === userTotalPages}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "hosts" && (
            <div className="space-y-6">
              {/* Hosts Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161230] border border-white/10 p-4 rounded-2xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Host & Broadcaster Management</span>
                  </h3>
                  <p className="text-xs text-white/50">Manage approved creators, assign simulated streams, and adjust payout rates.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowCreateHostModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg shadow-primary/20"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create New Host</span>
                  </button>
                  <button
                    onClick={() => handleOpenLaunchStream()}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5"
                  >
                    <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                    <span>Launch Live Stream</span>
                  </button>
                </div>
              </div>

              {loading && hosts.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
              ) : hosts.length === 0 ? (
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-12 text-center text-white/50">
                  No approved hosts found. Click "+ Create New Host" above to add your first creator.
                </div>
              ) : (
                <>
                  <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                          <th className="px-6 py-4">Host</th>
                          <th className="px-6 py-4">Platform Fee %</th>
                          <th className="px-6 py-4">Total Earnings</th>
                          <th className="px-6 py-4">Withdrawable Balance</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {hosts.map((host) => {
                          const profile = host.profile || {};
                          return (
                            <tr key={host._id} className="hover:bg-white/5 transition">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={host.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                                    alt=""
                                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                                  />
                                  <div>
                                    <div className="font-bold text-white flex items-center space-x-1.5">
                                      <span>{host.name || "Unnamed Host"}</span>
                                      <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 rounded px-1.5 py-0.5">
                                        📷 {(profile.photos || host.galleryPhotos || []).length} photos
                                      </span>
                                    </div>
                                    <div className="text-xs text-white/50">{host.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-semibold text-white/80">
                                {profile.platformFeePercent ?? 30}%
                              </td>
                              <td className="px-6 py-4 font-bold text-emerald-400">
                                {profile.totalEarningsCoins ?? 0} coins
                              </td>
                              <td className="px-6 py-4 font-bold text-amber-400">
                                {profile.withdrawableBalanceCoins ?? 0} coins
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${host.isLive
                                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                    : "bg-white/5 text-white/40 border border-white/10"
                                  }`}>
                                  {host.isLive ? "LIVE NOW" : "OFFLINE"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleOpenLaunchStream(host._id)}
                                    className="bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                                    title="Start a live broadcast for this host (YouTube/Shorts/MP4)"
                                  >
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>Go Live</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenEditUser(host)}
                                    className="bg-white/5 text-white/80 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/10 transition flex items-center space-x-1"
                                    title="Edit Host Profile"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleHostPayout(host._id, profile.withdrawableBalanceCoins || 0)}
                                    disabled={actionLoading || !profile.withdrawableBalanceCoins || profile.withdrawableBalanceCoins <= 0}
                                    className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-30 disabled:hover:bg-primary/20 disabled:hover:text-primary"
                                  >
                                    Payout
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-white/50">Page {hostPage} of {hostTotalPages}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setHostPage(p => Math.max(p - 1, 1))}
                        disabled={hostPage === 1}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setHostPage(p => Math.min(p + 1, hostTotalPages))}
                        disabled={hostPage === hostTotalPages}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              {/* Filters Panel */}
              <div className="flex flex-wrap gap-4 bg-[#161230] border border-white/10 p-4 rounded-xl items-center">
                <div className="flex flex-col">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Ledger Type</label>
                  <select
                    value={txLedger}
                    onChange={(e) => { setTxLedger(e.target.value); setTxCategory(""); setTxType(""); setTxPage(1); }}
                    className="bg-[#0F0C20] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none font-bold"
                  >
                    <option value="wallet">User Wallet (Spent/Recharges)</option>
                    <option value="earnings">Broadcaster Earnings (Income/Payouts)</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={(e) => { setTxType(e.target.value); setTxPage(1); }}
                    className="bg-[#0F0C20] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="credit">Credits (Received)</option>
                    <option value="debit">Debits (Spent/Payouts)</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => { setTxCategory(e.target.value); setTxPage(1); }}
                    className="bg-[#0F0C20] border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                  >
                    {txLedger === "wallet" ? (
                      <>
                        <option value="">All Categories</option>
                        <option value="recharge">Recharges</option>
                        <option value="gift_sent">Gifts Sent</option>
                        <option value="subscription_purchased">Sub Purchased</option>
                        <option value="withdrawal">Withdrawals</option>
                        <option value="other">Other</option>
                      </>
                    ) : (
                      <>
                        <option value="">All Categories</option>
                        <option value="gift_received">Gifts Received</option>
                        <option value="subscription_received">Sub Received</option>
                        <option value="withdrawal">Withdrawals/Payouts</option>
                        <option value="other">Other</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {loading && transactions.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
              ) : transactions.length === 0 ? (
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-12 text-center text-white/50">
                  No transactions matches filters.
                </div>
              ) : (
                <>
                  <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Coins Amount</th>
                          <th className="px-6 py-4">Platform Fee Take</th>
                          <th className="px-6 py-4">Timestamp</th>
                          <th className="px-6 py-4">Audit Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {transactions.map((tx) => (
                          <tr key={tx._id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={tx.userId?.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                  <div className="font-bold text-white">{tx.userId?.name || "Unnamed"}</div>
                                  <div className="text-xs text-white/50">{tx.userId?.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tx.type === "credit" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                }`}>
                                {tx.category || "other"}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold">
                              <span className={tx.type === "credit" ? "text-emerald-400" : "text-red-400"}>
                                {tx.type === "credit" ? "+" : "-"}{tx.amountCoins}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/60">
                              {tx.platformFeeCoins > 0 ? (
                                <span className="text-amber-500 font-bold">{tx.platformFeeCoins} coins</span>
                              ) : "-"}
                            </td>
                            <td className="px-6 py-4 text-white/50 text-xs">
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-white/70 max-w-[200px] truncate text-xs">
                              {tx.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-white/50">Page {txPage} of {txTotalPages}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTxPage(p => Math.max(p - 1, 1))}
                        disabled={txPage === 1}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setTxPage(p => Math.min(p + 1, txTotalPages))}
                        disabled={txPage === txTotalPages}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "streams" && (
            <div className="space-y-6">
              {/* Streams Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#161230] border border-white/10 p-4 rounded-2xl">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Tv className="h-5 w-5 text-red-500" />
                    <span>Live Stream Broadcasts Monitor</span>
                  </h3>
                  <p className="text-xs text-white/50">Real-time live streams monitoring & YouTube/Video simulated broadcast launcher.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleOpenLaunchStream()}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg shadow-red-500/20"
                  >
                    <Radio className="h-4 w-4 animate-pulse" />
                    <span>Launch Live Stream (YouTube / Video / LiveKit)</span>
                  </button>
                </div>
              </div>

              {loading && streams.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
              ) : streams.length === 0 ? (
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-12 text-center text-white/50">
                  No active live streams currently running. Click "Launch Live Stream" to start one.
                </div>
              ) : (
                <>
                  <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Host Details</th>
                          <th className="px-6 py-4">Title & Details</th>
                          <th className="px-6 py-4">Stream Source</th>
                          <th className="px-6 py-4">Pricing</th>
                          <th className="px-6 py-4">Viewers</th>
                          <th className="px-6 py-4">Started At</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {streams.map((stream) => {
                          const srcType = stream.streamSourceType || (stream.liveStreamProvider === "youtube" ? "youtube" : (stream.liveStreamProvider === "video_url" ? "video_url" : "livekit"));
                          const isLive = stream.status === "live";
                          return (
                            <tr key={stream._id} className="hover:bg-white/5 transition">
                              <td className="px-6 py-4">
                                {isLive ? (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-ping"></span>
                                    LIVE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/50 border border-white/10">
                                    ENDED
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={stream.hostId?.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                                    alt=""
                                    className="h-10 w-10 rounded-full object-cover border border-white/10"
                                  />
                                  <div>
                                    <div className="font-bold text-white flex items-center space-x-1.5">
                                      <span>{stream.hostId?.name || "Unnamed Host"}</span>
                                      {stream.isAdminSimulated && (
                                        <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">
                                          SIMULATED
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-white/50">{stream.hostId?.email || "Unknown Email"}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 max-w-[240px]">
                                <div className="font-semibold text-white truncate">{stream.title}</div>
                                <div className="text-xs text-white/40 truncate">{stream.description || "No description"}</div>
                                {stream.youtubeVideoId && (
                                  <div className="text-[10px] text-red-400 font-mono mt-0.5 flex items-center space-x-1">
                                    <span>YT ID: {stream.youtubeVideoId}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                  srcType === "youtube" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                                  srcType === "video_url" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                                  "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                }`}>
                                  {srcType === "youtube" ? "🔴 YouTube" : srcType === "video_url" ? "🎬 Video MP4" : "📡 LiveKit"}
                                </span>
                              </td>
                              <td className="px-6 py-4 uppercase font-bold text-xs">
                                <span className={`inline-flex px-2 py-0.5 rounded ${
                                  stream.streamType === "public" ? "bg-green-500/10 text-green-400" :
                                  stream.streamType === "subscriber_only" ? "bg-amber-500/10 text-amber-400" : "bg-primary/10 text-primary"
                                }`}>
                                  {stream.streamType}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-primary">
                                {stream.currentViewerCount || 0}
                              </td>
                              <td className="px-6 py-4 text-white/50 text-xs">
                                {new Date(stream.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {isLive ? (
                                  <button
                                    onClick={() => handleEndStream(stream._id)}
                                    className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
                                  >
                                    End Stream
                                  </button>
                                ) : (
                                  <span className="text-white/30 text-xs italic">
                                    Concluded
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-white/50">Page {streamPage} of {streamTotalPages}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setStreamPage(p => Math.max(p - 1, 1))}
                        disabled={streamPage === 1}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setStreamPage(p => Math.min(p + 1, streamTotalPages))}
                        disabled={streamPage === streamTotalPages}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6">
              {loading && helpRequests.length === 0 ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div></div>
              ) : helpRequests.length === 0 ? (
                <div className="bg-[#161230] border border-white/10 rounded-2xl p-12 text-center text-white/50">
                  No help support requests found.
                </div>
              ) : (
                <>
                  <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                          <th className="px-6 py-4">User Details</th>
                          <th className="px-6 py-4">Subject</th>
                          <th className="px-6 py-4">Message</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Created At</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {helpRequests.map((req) => (
                          <tr key={req._id} className="hover:bg-white/5 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={req.userId?.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                                />
                                <div>
                                  <div className="font-bold text-white">{req.userId?.name || "Unnamed"}</div>
                                  <div className="text-xs text-white/50">{req.userId?.email || "Unknown Email"}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-white/90">
                              {req.subject}
                            </td>
                            <td className="px-6 py-4 text-white/70 max-w-[200px] truncate">
                              {req.message}
                              {req.replyMessage && (
                                <div className="text-[10px] text-emerald-400 mt-1 italic">
                                  Reply: {req.replyMessage}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                req.status === "replied" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                req.status === "resolved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-white/50 text-xs">
                              {new Date(req.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => { setSelectedTicket(req); setShowReplyModal(true); }}
                                className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition"
                              >
                                Reply Ticket
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs text-white/50">Page {helpPage} of {helpTotalPages}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setHelpPage(p => Math.max(p - 1, 1))}
                        disabled={helpPage === 1}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setHelpPage(p => Math.min(p + 1, helpTotalPages))}
                        disabled={helpPage === helpTotalPages}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-12">
              {/* Reports Table Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>User Report Logs</span>
                </h2>
                {loading && reports.length === 0 ? (
                  <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : reports.length === 0 ? (
                  <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 text-center text-white/50">
                    No reports submitted yet.
                  </div>
                ) : (
                  <>
                    <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                            <th className="px-6 py-4">Reporter</th>
                            <th className="px-6 py-4">Reported User</th>
                            <th className="px-6 py-4">Reason Category</th>
                            <th className="px-6 py-4">Details</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {reports.map((rep) => (
                            <tr key={rep._id} className="hover:bg-white/5 transition">
                              <td className="px-6 py-4 font-semibold text-white/80">
                                {rep.reporterId?.name || "Unnamed"} ({rep.reporterId?.role})
                              </td>
                              <td className="px-6 py-4 font-bold text-red-400">
                                {rep.reportedUserId?.name || "Unnamed"} ({rep.reportedUserId?.role})
                              </td>
                              <td className="px-6 py-4 font-semibold uppercase text-xs">
                                {rep.reason}
                              </td>
                              <td className="px-6 py-4 text-white/60 text-xs max-w-[150px] truncate">
                                {rep.description || "-"}
                              </td>
                              <td className="px-6 py-4 uppercase text-[10px] font-bold">
                                <span className={`inline-flex px-2 py-0.5 rounded ${
                                  rep.status === "resolved" ? "bg-green-500/10 text-green-400" :
                                  rep.status === "rejected" ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                                }`}>
                                  {rep.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-white/50 text-xs">
                                {new Date(rep.createdAt).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                {rep.status === "pending" && (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleReviewReport(rep._id, "resolved")}
                                      className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white px-2.5 py-1 rounded text-xs transition"
                                    >
                                      Resolve
                                    </button>
                                    <button
                                      onClick={() => handleReviewReport(rep._id, "rejected")}
                                      className="bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white px-2.5 py-1 rounded text-xs transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-white/50">Page {reportPage} of {reportTotalPages}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setReportPage(p => Math.max(p - 1, 1))}
                          disabled={reportPage === 1}
                          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setReportPage(p => Math.min(p + 1, reportTotalPages))}
                          disabled={reportPage === reportTotalPages}
                          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Blocks Table Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span>Active Block Logs</span>
                </h2>
                {loading && blocks.length === 0 ? (
                  <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : blocks.length === 0 ? (
                  <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 text-center text-white/50">
                    No active user blocks found.
                  </div>
                ) : (
                  <>
                    <div className="bg-[#161230] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 bg-[#0F0C20]/50 text-xs font-semibold tracking-wider text-white/60">
                            <th className="px-6 py-4">Source User</th>
                            <th className="px-6 py-4">Blocked User</th>
                            <th className="px-6 py-4">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {blocks.map((bl, i) => (
                            <tr key={i} className="hover:bg-white/5 transition">
                              <td className="px-6 py-4 font-semibold text-white/80">
                                {bl.user?.name || "Unnamed"} ({bl.user?.email})
                              </td>
                              <td className="px-6 py-4 font-bold text-red-400">
                                {bl.blockedUser?.name || "Unnamed"} ({bl.blockedUser?.email})
                              </td>
                              <td className="px-6 py-4 text-white/50 text-xs">
                                {new Date(bl.blockedAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-white/50">Page {blockPage} of {blockTotalPages}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setBlockPage(p => Math.max(p - 1, 1))}
                          disabled={blockPage === 1}
                          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setBlockPage(p => Math.min(p + 1, blockTotalPages))}
                          disabled={blockPage === blockTotalPages}
                          className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 disabled:opacity-30"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-xl mx-auto bg-[#161230] border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <Layers className="h-6 w-6 text-primary animate-pulse" />
                <h2 className="text-xl font-bold text-white">FCM Push Notification Broadcast</h2>
              </div>
              <p className="text-xs text-white/50">Send customized push alerts and database in-app notifications instantly.</p>

              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Target Audience</label>
                  <select
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value)}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="all">All Users & Broadcasters</option>
                    <option value="hosts">Approved Creator Hosts Only</option>
                    <option value="users">Ordinary Viewers Only</option>
                    <option value="individual">Target Specific User ID</option>
                  </select>
                </div>

                {notifTarget === "individual" && (
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Recipient User ID (MongoDB Object ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 65c92f8b5f3a..."
                      value={notifUserId}
                      onChange={(e) => setNotifUserId(e.target.value)}
                      className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Notification Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Special Offer! 💎"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Message Body</label>
                  <textarea
                    rows="4"
                    placeholder="Type broadcast message details here..."
                    value={notifBody}
                    onChange={(e) => setNotifBody(e.target.value)}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                >
                  {actionLoading ? "Broadcasting Alert..." : "DISPATCH BROADCAST NOW"}
                </button>
              </form>
            </div>
          )}

          {activeTab === "config" && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Card with Save Button */}
              <div className="bg-[#161230] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-primary/20 rounded-xl text-primary border border-primary/30">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">System Settings & Provider Configuration</h2>
                    <p className="text-xs text-white/50">Manage dynamic AI models, streaming RTC credentials, payment gateways, and app settings.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUpdateConfig}
                  disabled={actionLoading}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  <Save className="h-4 w-4" />
                  <span>{actionLoading ? "Saving..." : "Save All Configurations"}</span>
                </button>
              </div>

              {/* Sub-Tabs Navigation */}
              <div className="bg-[#161230] border border-white/10 rounded-2xl p-2 flex flex-wrap gap-2 shadow-lg">
                {[
                  { id: "ai", label: "AI Models & Chat", icon: Bot, badge: "New" },
                  { id: "streaming", label: "RTC Streaming", icon: Tv },
                  { id: "payments", label: "Payments & Payouts", icon: CreditCard },
                  { id: "admob", label: "AdMob Monetization", icon: Smartphone },
                  { id: "updates", label: "OTA App Updates", icon: Radio },
                  { id: "offers", label: "Promotional Offers", icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = configSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setConfigSubTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-primary text-white shadow-lg shadow-primary/30"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold ml-1">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Form */}
              <form onSubmit={handleUpdateConfig} className="bg-[#161230] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">

                {/* 1. AI CHAT & LLM MODELS */}
                {configSubTab === "ai" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                      <Bot className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-bold text-white">AI Companion & LLM Engine Settings</h3>
                        <p className="text-xs text-white/50">Configure OpenRouter API credentials, primary chat model, fallback models, and message quotas.</p>
                      </div>
                    </div>

                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-white/80 flex items-center space-x-1.5">
                            <Key className="h-3.5 w-3.5 text-primary" />
                            <span>OpenRouter API Key</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="text-[11px] text-primary hover:underline flex items-center space-x-1"
                          >
                            {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            <span>{showApiKey ? "Hide Key" : "Show Key"}</span>
                          </button>
                        </div>
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={sysConfig.openRouterApiKey || ""}
                          onChange={(e) => setSysConfig({ ...sysConfig, openRouterApiKey: e.target.value })}
                          placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx (leave empty to use server .env)"
                          className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary font-mono"
                        />
                        <p className="text-[11px] text-white/40 mt-1">
                          🔑 Enter your OpenRouter API key here. Providing a key with credits removes the 50 free-tier requests/day limit and prevents 429 errors.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center space-x-1.5">
                          <Cpu className="h-3.5 w-3.5 text-primary" />
                          <span>Primary AI Model Slug</span>
                        </label>
                        <input
                          type="text"
                          value={sysConfig.openRouterModel || ""}
                          onChange={(e) => setSysConfig({ ...sysConfig, openRouterModel: e.target.value })}
                          placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                          className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary font-mono mb-2"
                        />

                        {/* Quick Preset Pills */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] text-white/50 block font-medium">Quick Select Model:</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { label: "Llama 3.3 70B (Best Flirty)", slug: "meta-llama/llama-3.3-70b-instruct" },
                              { label: "Gemini 2.0 Flash (Fast)", slug: "google/gemini-2.0-flash-001" },
                              { label: "DeepSeek Chat", slug: "deepseek/deepseek-chat" },
                              { label: "Qwen 2.5 72B (Multilingual)", slug: "qwen/qwen-2.5-72b-instruct" },
                              { label: "Gemma 4 31B (Free Tier)", slug: "google/gemma-4-31b-it:free" },
                              { label: "Nemotron 3.5 (Free Tier)", slug: "nvidia/nemotron-3.5-lightning:free" },
                            ].map((preset) => (
                              <button
                                key={preset.slug}
                                type="button"
                                onClick={() => setSysConfig({ ...sysConfig, openRouterModel: preset.slug })}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                                  sysConfig.openRouterModel === preset.slug
                                    ? "bg-primary/20 border-primary text-primary font-semibold"
                                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/80 mb-1.5">Fallback Models (Comma-separated)</label>
                        <input
                          type="text"
                          value={sysConfig.openRouterFallbackModels || ""}
                          onChange={(e) => setSysConfig({ ...sysConfig, openRouterFallbackModels: e.target.value })}
                          placeholder="google/gemma-4-31b-it:free, nvidia/nemotron-3.5-lightning:free, liquid/lfm-2.5-2.6b:free"
                          className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-primary font-mono"
                        />
                        <p className="text-[11px] text-white/40 mt-1">
                          Backup models tried sequentially if primary model hits rate limit or maintenance.
                        </p>
                      </div>
                    </div>

                    {/* AI Message Quota Settings */}
                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider mb-3">AI Quotas & Monetization Rates</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Free Messages per User (Per Host)</label>
                          <input
                            type="number"
                            min="0"
                            value={sysConfig.aiFreeMessagesQuota ?? 5}
                            onChange={(e) => setSysConfig({ ...sysConfig, aiFreeMessagesQuota: Number(e.target.value) })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                          />
                          <p className="text-[11px] text-white/40 mt-1">Default free introductory messages before requiring ads or coins.</p>
                        </div>
                        <div>
                          <label className="block text-xs text-white/60 mb-1">Coins Cost per Message (After Free)</label>
                          <input
                            type="number"
                            min="1"
                            value={sysConfig.aiCoinsPerMessage ?? 5}
                            onChange={(e) => setSysConfig({ ...sysConfig, aiCoinsPerMessage: Number(e.target.value) })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                          />
                          <p className="text-[11px] text-white/40 mt-1">Coins debited per message when free limit is exhausted.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RTC STREAMING SETTINGS */}
                {configSubTab === "streaming" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                      <Tv className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-bold text-white">Live RTC Streaming Architecture</h3>
                        <p className="text-xs text-white/50">Manage Agora RTC and LiveKit WebRTC credentials and active streaming protocol.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Active Streaming Method</label>
                      <select
                        value={sysConfig.activeLiveStreamProvider}
                        onChange={(e) => setSysConfig({ ...sysConfig, activeLiveStreamProvider: e.target.value })}
                        className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                      >
                        <option value="agora">Agora RTC (Default Production Engine)</option>
                        <option value="livekit">LiveKit WebRTC</option>
                        <option value="youtube">YouTube Embed (Live ID)</option>
                      </select>
                    </div>

                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">Agora RTC Credentials</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Agora App ID</label>
                          <input
                            type="text"
                            value={sysConfig.agoraAppId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, agoraAppId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Agora App Certificate</label>
                          <input
                            type="password"
                            value={sysConfig.agoraAppCertificate || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, agoraAppCertificate: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">LiveKit WebRTC Credentials</h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-3">
                          <label className="block text-xs text-white/50 mb-1">LiveKit Server URL</label>
                          <input
                            type="text"
                            value={sysConfig.livekitUrl || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, livekitUrl: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-1.5">
                          <label className="block text-xs text-white/50 mb-1">LiveKit API Key</label>
                          <input
                            type="text"
                            value={sysConfig.livekitApiKey || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, livekitApiKey: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-1.5">
                          <label className="block text-xs text-white/50 mb-1">LiveKit API Secret</label>
                          <input
                            type="password"
                            value={sysConfig.livekitApiSecret || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, livekitApiSecret: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PAYMENTS & PAYOUTS */}
                {configSubTab === "payments" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-bold text-white">Payment Gateways & Creator Payouts</h3>
                        <p className="text-xs text-white/50">Manage Razorpay, Cashfree Payment Gateway, Cashfree Payouts, and platform fees.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Active Payment Gateway</label>
                        <select
                          value={sysConfig.activePaymentGateway}
                          onChange={(e) => setSysConfig({ ...sysConfig, activePaymentGateway: e.target.value })}
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                        >
                          <option value="cashfree">Cashfree Payments</option>
                          <option value="razorpay">Razorpay Checkout</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Platform Fee Commission (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={sysConfig.platformFeePercent ?? 30}
                          onChange={(e) => setSysConfig({ ...sysConfig, platformFeePercent: Number(e.target.value) })}
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Razorpay Card */}
                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">Razorpay Gateway Credentials</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Key ID</label>
                          <input
                            type="text"
                            value={sysConfig.razorpayKeyId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, razorpayKeyId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Key Secret</label>
                          <input
                            type="password"
                            value={sysConfig.razorpayKeySecret || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, razorpayKeySecret: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cashfree PG */}
                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">Cashfree Payment Gateway (Deposit)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">App Client ID</label>
                          <input
                            type="text"
                            value={sysConfig.cashfreeClientId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, cashfreeClientId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Client Key Secret</label>
                          <input
                            type="password"
                            value={sysConfig.cashfreeClientSecret || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, cashfreeClientSecret: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={sysConfig.cashfreeEnvironment === "sandbox"}
                            onChange={(e) => setSysConfig({ ...sysConfig, cashfreeEnvironment: e.target.checked ? "sandbox" : "production" })}
                            className="h-4 w-4 bg-[#161230] border border-white/10 text-primary focus:outline-none"
                          />
                          <span className="text-xs text-white/70">Enable sandbox testing environment for Cashfree Deposits</span>
                        </div>
                      </div>
                    </div>

                    {/* Cashfree Payout */}
                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider">Cashfree Host Payouts (Withdrawals)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Payout Client ID</label>
                          <input
                            type="text"
                            value={sysConfig.cashfreePayoutClientId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, cashfreePayoutClientId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Payout Client Secret</label>
                          <input
                            type="password"
                            value={sysConfig.cashfreePayoutClientSecret || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, cashfreePayoutClientSecret: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={sysConfig.cashfreePayoutEnvironment === "sandbox"}
                            onChange={(e) => setSysConfig({ ...sysConfig, cashfreePayoutEnvironment: e.target.checked ? "sandbox" : "production" })}
                            className="h-4 w-4 bg-[#161230] border border-white/10 text-primary focus:outline-none"
                          />
                          <span className="text-xs text-white/70">Enable sandbox testing environment for Cashfree Payouts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ADMOB MONETIZATION */}
                {configSubTab === "admob" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-bold text-white">Google AdMob Ads & Monetization</h3>
                        <p className="text-xs text-white/50">Control mobile ad placements, ad units, and coin rewards for user ad views.</p>
                      </div>
                    </div>

                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={sysConfig.admobEnabled !== false}
                          onChange={(e) => setSysConfig({ ...sysConfig, admobEnabled: e.target.checked })}
                          className="h-4 w-4 bg-[#161230] border border-white/10 text-primary focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-white/90">Enable AdMob Monetization in Mobile App</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="col-span-2">
                          <label className="block text-xs text-white/50 mb-1">AdMob App ID</label>
                          <input
                            type="text"
                            value={sysConfig.admobAppId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, admobAppId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Rewarded Interstitial Unit ID</label>
                          <input
                            type="text"
                            value={sysConfig.admobRewardedInterstitialAdUnitId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, admobRewardedInterstitialAdUnitId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Rewarded Video Ad Unit ID</label>
                          <input
                            type="text"
                            value={sysConfig.admobRewardedAdUnitId || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, admobRewardedAdUnitId: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none font-mono"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs text-white/50 mb-1">User Reward Coins Per Ad</label>
                          <input
                            type="number"
                            min="1"
                            value={sysConfig.adRewardCoins || 10}
                            onChange={(e) => setSysConfig({ ...sysConfig, adRewardCoins: Number(e.target.value) })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. OTA APP UPDATES */}
                {configSubTab === "updates" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                      <Radio className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-bold text-white">App Versioning & OTA Force Update</h3>
                        <p className="text-xs text-white/50">Manage remote update prompts and enforce mandatory updates for older clients.</p>
                      </div>
                    </div>

                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!sysConfig.forceUpdate}
                          onChange={(e) => setSysConfig({ ...sysConfig, forceUpdate: e.target.checked })}
                          className="h-4 w-4 bg-[#161230] border border-white/10 text-primary focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-white/90">Force Users to Update App on Launch</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Minimum Required Version</label>
                          <input
                            type="text"
                            value={sysConfig.minAppVersion || "1.0.0"}
                            onChange={(e) => setSysConfig({ ...sysConfig, minAppVersion: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Latest Version on Play Store</label>
                          <input
                            type="text"
                            value={sysConfig.latestAppVersion || "1.0.0"}
                            onChange={(e) => setSysConfig({ ...sysConfig, latestAppVersion: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-white/50 mb-1">Play Store Download / Update URL</label>
                          <input
                            type="text"
                            value={sysConfig.updateUrl || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, updateUrl: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-white/50 mb-1">Update Prompt Message</label>
                          <textarea
                            rows="2"
                            value={sysConfig.updateMessage || ""}
                            onChange={(e) => setSysConfig({ ...sysConfig, updateMessage: e.target.value })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. PROMOTIONAL OFFERS */}
                {configSubTab === "offers" && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="flex items-center space-x-2 pb-3 border-b border-white/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-base font-bold text-white">Promotional Offer Card & Feed Banner</h3>
                        <p className="text-xs text-white/50">Publish dynamic promo cards, discount banners, and custom offers into user feed.</p>
                      </div>
                    </div>

                    <div className="bg-[#0F0C20] border border-white/5 rounded-xl p-4 space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!!sysConfig.offerBanner?.enabled}
                          onChange={(e) => setSysConfig({
                            ...sysConfig,
                            offerBanner: { ...(sysConfig.offerBanner || {}), enabled: e.target.checked }
                          })}
                          className="h-4 w-4 bg-[#161230] border border-white/10 text-primary focus:outline-none"
                        />
                        <span className="text-xs font-semibold text-white/90">Enable Promotional Offer Banner in User Feed</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="col-span-2">
                          <label className="block text-xs text-white/50 mb-1">Offer Title</label>
                          <input
                            type="text"
                            value={sysConfig.offerBanner?.title || ""}
                            onChange={(e) => setSysConfig({
                              ...sysConfig,
                              offerBanner: { ...(sysConfig.offerBanner || {}), title: e.target.value }
                            })}
                            placeholder="e.g. 🎁 Special Bonus Coins Offer!"
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-white/50 mb-1">Offer Description</label>
                          <textarea
                            rows="2"
                            value={sysConfig.offerBanner?.description || ""}
                            onChange={(e) => setSysConfig({
                              ...sysConfig,
                              offerBanner: { ...(sysConfig.offerBanner || {}), description: e.target.value }
                            })}
                            placeholder="e.g. Recharge now and get up to 50% extra free coins."
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-white/50 mb-1">Banner Image URL</label>
                          <input
                            type="text"
                            value={sysConfig.offerBanner?.imageUrl || ""}
                            onChange={(e) => setSysConfig({
                              ...sysConfig,
                              offerBanner: { ...(sysConfig.offerBanner || {}), imageUrl: e.target.value }
                            })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                          {sysConfig.offerBanner?.imageUrl && (
                            <div className="mt-3 relative rounded-xl overflow-hidden border border-white/10 h-32 bg-[#161230]">
                              <img
                                src={sysConfig.offerBanner.imageUrl}
                                alt="Offer Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white font-medium">
                                Live Preview
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Target Action</label>
                          <select
                            value={sysConfig.offerBanner?.actionType || "wallet"}
                            onChange={(e) => setSysConfig({
                              ...sysConfig,
                              offerBanner: { ...(sysConfig.offerBanner || {}), actionType: e.target.value }
                            })}
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          >
                            <option value="wallet">Open Wallet / Recharge (Internal)</option>
                            <option value="stream">Open Live Stream (Internal)</option>
                            <option value="url">External Sponsor Link (Browser)</option>
                          </select>
                        </div>
                        {sysConfig.offerBanner?.actionType === "url" && (
                          <div className="col-span-2">
                            <label className="block text-xs text-white/50 mb-1">External Sponsor Link URL</label>
                            <input
                              type="text"
                              value={sysConfig.offerBanner?.actionUrl || ""}
                              onChange={(e) => setSysConfig({
                                ...sysConfig,
                                offerBanner: { ...(sysConfig.offerBanner || {}), actionUrl: e.target.value }
                              })}
                              placeholder="https://sponsor.com/deal"
                              className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                            />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Target User ID (leave empty for all users)</label>
                          <input
                            type="text"
                            value={sysConfig.offerBanner?.targetUserId || ""}
                            onChange={(e) => setSysConfig({
                              ...sysConfig,
                              offerBanner: {
                                ...(sysConfig.offerBanner || {}),
                                targetUserId: e.target.value,
                                isGlobal: !e.target.value
                              }
                            })}
                            placeholder="Leave blank for global audience"
                            className="w-full bg-[#161230] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom Submit Action */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/40">All changes apply instantly across app & backend cache.</span>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    <Save className="h-4 w-4" />
                    <span>{actionLoading ? "Saving Configurations..." : "SAVE ALL CONFIGURATIONS"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* KYC Documents Preview Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#0F0C20]">
              <h2 className="text-lg font-bold text-white">Broadcaster Application Audit</h2>
              <button onClick={() => setSelectedApp(null)} className="text-white/60 hover:text-white">&times;</button>
            </header>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase">Full Legal Name</h4>
                  <p className="text-sm font-semibold">{selectedApp.kycDocuments?.panCard?.name || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase">DOB</h4>
                  <p className="text-sm font-semibold">{selectedApp.dob || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase">Aadhaar Number</h4>
                  <p className="text-sm font-semibold">{selectedApp.kycDocuments?.aadhaarCard?.aadhaarNumber || "Not provided"}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/40 uppercase">PAN Card Number</h4>
                  <p className="text-sm font-semibold">{selectedApp.kycDocuments?.panCard?.panNumber || "Not provided"}</p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-xs font-semibold text-white/40 uppercase">Residential Address</h4>
                  <p className="text-sm font-semibold">{selectedApp.city}, {selectedApp.state}, {selectedApp.country}</p>
                </div>
              </div>

              {/* Document Images Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0F0C20] rounded-xl border border-white/5 p-4 flex flex-col justify-between h-56">
                  <div>
                    <h4 className="text-xs font-bold text-white/60 mb-2">PAN Card Document</h4>
                    <p className="text-[10px] text-white/40 mb-3 truncate">Source: {selectedApp.kycDocuments?.panCard?.documentUrl || "None"}</p>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-white/10">
                    {selectedApp.kycDocuments?.panCard?.documentUrl ? (
                      <img src={selectedApp.kycDocuments.panCard.documentUrl} alt="PAN Card" className="object-contain h-full w-full" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-xs text-white/30">Document image unavailable</span>'; }} />
                    ) : (
                      <span className="text-xs text-white/30">No Image Uploaded</span>
                    )}
                  </div>
                </div>

                <div className="bg-[#0F0C20] rounded-xl border border-white/5 p-4 flex flex-col justify-between h-56">
                  <div>
                    <h4 className="text-xs font-bold text-white/60 mb-2">Aadhaar Card Document</h4>
                    <p className="text-[10px] text-white/40 mb-3 truncate">Source: {selectedApp.kycDocuments?.aadhaarCard?.documentUrl || "None"}</p>
                  </div>
                  <div className="flex-1 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center border border-dashed border-white/10">
                    {selectedApp.kycDocuments?.aadhaarCard?.documentUrl ? (
                      <img src={selectedApp.kycDocuments.aadhaarCard.documentUrl} alt="Aadhaar Card" className="object-contain h-full w-full" onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="text-xs text-white/30">Document image unavailable</span>'; }} />
                    ) : (
                      <span className="text-xs text-white/30">No Image Uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Consent & Signed Terms display */}
              <div className="bg-[#FF007F]/10 border border-[#FF007F]/20 p-4 rounded-xl text-xs space-y-2">
                <div className="flex items-center space-x-2 text-primary font-bold">
                  <CheckCircle className="h-4 w-4" />
                  <span>Revenue Share & Tax Consent Verified</span>
                </div>
                <p className="text-white/70">
                  Applicant signed dynamic terms (V{selectedApp.termsVersion || "1.0"}) at {new Date(selectedApp.agreedAt || selectedApp.createdAt).toLocaleString()}.
                  Agreed to 30% default fee and confirmed sole responsibility of personal income tax.
                </p>
              </div>

              {selectedApp.status === "pending" && (
                <div className="flex justify-end space-x-3 border-t border-white/5 pt-4">
                  <button
                    onClick={() => { setReviewStatus("rejected"); setShowReviewModal(true); }}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-sm flex items-center space-x-1.5 transition"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject Application</span>
                  </button>
                  <button
                    onClick={() => { setReviewStatus("approved"); setShowReviewModal(true); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-sm flex items-center space-x-1.5 transition"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve Host</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (Inside KYC Modal for detail reason/fee setting) */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0F0C20]">
              <h3 className="text-md font-bold text-white">
                {reviewStatus === "approved" ? "Approve Application" : "Reject Application"}
              </h3>
            </header>

            <div className="p-6 space-y-4">
              {reviewStatus === "approved" ? (
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Set Platform Fee Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customPlatformFee}
                    onChange={(e) => setCustomPlatformFee(Number(e.target.value))}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                  />
                  <p className="text-[10px] text-white/40 mt-1">Defaults to 30% as agreed by broadcaster.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Provide Rejection Reason</label>
                  <textarea
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. KYC documents are blurry or invalid"
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewApplication}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition ${reviewStatus === "approved" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Ticket Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0F0C20] flex justify-between items-center">
              <h3 className="text-md font-bold text-white">
                Reply to Ticket
              </h3>
              <button
                onClick={() => { setShowReplyModal(false); setSelectedTicket(null); setReplyMessage(""); }}
                className="text-white/60 hover:text-white text-xl"
              >
                &times;
              </button>
            </header>

            <div className="p-6 space-y-4">
              <div className="bg-[#0F0C20] p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">User</span>
                  <span className="text-xs text-primary font-semibold">{selectedTicket.userId?.name || "Unnamed"} ({selectedTicket.userId?.email || "Unknown"})</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">Subject</span>
                  <p className="text-sm font-semibold text-white">{selectedTicket.subject || "General Inquiry"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold block mb-1">Message</span>
                  <p className="text-xs text-white/80 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Reply Message</label>
                <textarea
                  rows="4"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Enter response to the user..."
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => { setShowReplyModal(false); setSelectedTicket(null); setReplyMessage(""); }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplyTicket}
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  {actionLoading ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Give Coins Modal with Custom Push Notification */}
      {showCoinModal && selectedUserForCoins && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0F0C20] flex justify-between items-center">
              <div className="flex items-center space-x-2 text-amber-400">
                <Coins className="h-5 w-5" />
                <h3 className="text-md font-bold text-white">Grant Coins to User</h3>
              </div>
              <button
                onClick={() => { setShowCoinModal(false); setSelectedUserForCoins(null); }}
                className="text-white/60 hover:text-white text-xl"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleAssignCoins} className="p-6 space-y-4">
              <div className="bg-[#0F0C20] p-4 rounded-xl border border-white/5 flex items-center space-x-3">
                <img
                  src={selectedUserForCoins.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-white/10"
                />
                <div>
                  <div className="font-bold text-white text-sm">{selectedUserForCoins.name || "Unnamed User"}</div>
                  <div className="text-xs text-emerald-400 font-semibold">Current Balance: {selectedUserForCoins.coinBalance || 0} coins</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Coin Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[50, 100, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setCoinAmount(String(amt));
                        setCoinCustomMessage(`🎉 You received ${amt} free coins from CrowdCast!`);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        coinAmount === String(amt)
                          ? "bg-amber-500/30 text-amber-300 border-amber-500"
                          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  placeholder="Enter custom coin amount..."
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Grant Reason</label>
                <input
                  type="text"
                  value={coinReason}
                  onChange={(e) => setCoinReason(e.target.value)}
                  placeholder="e.g. Compensation, Promotion, Special Reward..."
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Custom Push Notification Message</label>
                <textarea
                  rows="3"
                  value={coinCustomMessage}
                  onChange={(e) => setCoinCustomMessage(e.target.value)}
                  placeholder="Message sent to user's phone notification..."
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-white/40 mt-1 block">This message will be automatically pushed to user's device via FCM and saved in their in-app notification center.</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCoinModal(false); setSelectedUserForCoins(null); }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !coinAmount}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold px-5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5"
                >
                  <Coins className="h-4 w-4" />
                  <span>{actionLoading ? "Granting..." : "Send Coins & Notification"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Create New Host Modal */}
      {showCreateHostModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0F0C20] flex justify-between items-center">
              <div className="flex items-center space-x-2 text-primary">
                <PlusCircle className="h-5 w-5" />
                <h3 className="text-md font-bold text-white">Create New Host Profile</h3>
              </div>
              <button
                onClick={() => setShowCreateHostModal(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleCreateHost} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center space-x-4">
                <img
                  src={createHostForm.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60"}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover border-2 border-primary/50 shadow-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={createHostForm.profilePhoto}
                    onChange={(e) => setCreateHostForm({ ...createHostForm, profilePhoto: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                  />
                  <div className="flex items-center space-x-1.5 mt-2">
                    <span className="text-[10px] text-white/40">Presets:</span>
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=60",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60"
                    ].map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCreateHostForm({ ...createHostForm, profilePhoto: imgUrl })}
                        className="h-6 w-6 rounded-full overflow-hidden border border-white/20 hover:border-primary transition"
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Host Display Name *</label>
                  <input
                    type="text"
                    value={createHostForm.name}
                    onChange={(e) => setCreateHostForm({ ...createHostForm, name: e.target.value })}
                    placeholder="e.g. Kiara Sharma"
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Email / Handle</label>
                  <input
                    type="text"
                    value={createHostForm.email}
                    onChange={(e) => setCreateHostForm({ ...createHostForm, email: e.target.value })}
                    placeholder="e.g. kiara@crowdcast.app"
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Bio / Tagline</label>
                <textarea
                  rows="2"
                  value={createHostForm.bio}
                  onChange={(e) => setCreateHostForm({ ...createHostForm, bio: e.target.value })}
                  placeholder="e.g. 🌟 Singer, Model & Night Live Streamer | Come chat!"
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    value={createHostForm.gender}
                    onChange={(e) => setCreateHostForm({ ...createHostForm, gender: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    value={createHostForm.country}
                    onChange={(e) => setCreateHostForm({ ...createHostForm, country: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Fee Cut %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={createHostForm.platformFeePercent}
                    onChange={(e) => setCreateHostForm({ ...createHostForm, platformFeePercent: Number(e.target.value) })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Host Gallery Photos */}
              <div className="bg-[#0F0C20] border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Image className="h-4 w-4 text-primary" />
                    <span>Host Gallery Photos</span>
                    <span className="text-primary font-normal text-[11px]">({(createHostForm.photos || []).length} / 10)</span>
                  </label>
                </div>

                {(createHostForm.photos || []).length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {(createHostForm.photos || []).map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/20 aspect-square bg-black/40">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCreateHostForm({
                            ...createHostForm,
                            photos: createHostForm.photos.filter((_, i) => i !== idx)
                          })}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={galleryInputUrl}
                    onChange={(e) => setGalleryInputUrl(e.target.value)}
                    placeholder="Paste Photo URL (https://...)"
                    className="flex-1 bg-[#161230] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!galleryInputUrl.trim()) return;
                      setCreateHostForm({
                        ...createHostForm,
                        photos: [...(createHostForm.photos || []), galleryInputUrl.trim()]
                      });
                      setGalleryInputUrl("");
                    }}
                    className="bg-primary/20 hover:bg-primary border border-primary/40 text-primary hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              {/* Romantic AI Persona */}
              <div className="bg-[#0F0C20] border border-white/10 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span>Romantic AI Character Persona (OpenRouter)</span>
                </label>
                <textarea
                  rows="2"
                  value={createHostForm.aiPersona || ""}
                  onChange={(e) => setCreateHostForm({ ...createHostForm, aiPersona: e.target.value })}
                  placeholder="Define the romantic flirting tone, affection, and chatting style..."
                  className="w-full bg-[#161230] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCreateHostForm({ ...createHostForm, aiPersona: "Sweet, affectionate, soft-spoken romantic companion who loves cute pet names, deep conversations, and caring for you warmly." })}
                    className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg px-2 py-0.5 text-white/70 transition"
                  >
                    💖 Sweet & Romantic
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateHostForm({ ...createHostForm, aiPersona: "Playful, flirty, charming and witty companion who loves romantic teasing, playful banter, cute compliments, and intimate laughter." })}
                    className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg px-2 py-0.5 text-white/70 transition"
                  >
                    🔥 Flirty & Playful
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateHostForm({ ...createHostForm, aiPersona: "Charismatic, seductive, confident and charming lover who speaks with allure, intense curiosity, and intimate emotional warmth." })}
                    className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg px-2 py-0.5 text-white/70 transition"
                  >
                    ✨ Seductive & Alluring
                  </button>
                </div>
              </div>

              {/* Exclusive Photo & Video Bundles (In-App Purchase Only) */}
              <div className="bg-[#0F0C20] border border-amber-500/20 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>Exclusive Media Bundles (Real In-App Purchase Only)</span>
                    <span className="text-white/50 text-[11px]">({(createHostForm.mediaBundles || []).length} bundles)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddBundleForm(!showAddBundleForm)}
                    className="text-[11px] bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 transition flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{showAddBundleForm ? "Close Form" : "New Bundle"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-white/60">
                  AI smartly teases these bundles during conversations. Users can view the free demo media, but full items can only be unlocked via Google Play In-App Purchase (never ads).
                </p>

                {(createHostForm.mediaBundles || []).length > 0 && (
                  <div className="space-y-2">
                    {createHostForm.mediaBundles.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#161230] border border-white/10 rounded-xl p-2.5">
                        <div className="flex items-center space-x-3">
                          {b.demoMediaUrl ? (
                            <img src={b.demoMediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-amber-400/30" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xs text-white/50">No Demo</div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white">{b.title}</span>
                              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{b.type}</span>
                            </div>
                            <div className="text-[11px] text-white/50 flex space-x-2">
                              <span>Demo Included</span>
                              <span>•</span>
                              <span>{(b.mediaItems || []).length} Locked Items</span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">₹{b.priceRupees || 49}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCreateHostForm({
                            ...createHostForm,
                            mediaBundles: createHostForm.mediaBundles.filter((_, i) => i !== idx)
                          })}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddBundleForm && (
                  <div className="bg-[#161230] border border-amber-500/30 rounded-xl p-3 space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/60">Bundle Title</label>
                        <input
                          type="text"
                          value={newBundleForm.title}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, title: e.target.value })}
                          placeholder="e.g. Romantic Beach Diary"
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60">Bundle Type</label>
                        <select
                          value={newBundleForm.type}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, type: e.target.value })}
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        >
                          <option value="photos">Photo Album (Images)</option>
                          <option value="video">Exclusive Video</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Demo Preview Media URL (Free demo preview)</label>
                      <input
                        type="url"
                        value={newBundleForm.demoMediaUrl}
                        onChange={(e) => setNewBundleForm({ ...newBundleForm, demoMediaUrl: e.target.value })}
                        placeholder="https://... (1 image or video thumbnail)"
                        className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Locked Full Media URLs (Comma or newline separated)</label>
                      <textarea
                        rows="2"
                        value={newBundleForm.mediaItemsText}
                        onChange={(e) => setNewBundleForm({ ...newBundleForm, mediaItemsText: e.target.value })}
                        placeholder="https://image1.jpg, https://image2.jpg"
                        className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/60">Price in Rupees (₹)</label>
                        <input
                          type="number"
                          value={newBundleForm.priceRupees}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, priceRupees: Number(e.target.value) })}
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60">Google Play Product ID</label>
                        <input
                          type="text"
                          value={newBundleForm.productId}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, productId: e.target.value })}
                          placeholder="bundle_photos_49"
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBundleForm.title.trim() || !newBundleForm.demoMediaUrl.trim()) {
                          return alert("Bundle title and demo media URL are required!");
                        }
                        const items = newBundleForm.mediaItemsText
                          .split(/[\n,]/)
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setCreateHostForm({
                          ...createHostForm,
                          mediaBundles: [
                            ...(createHostForm.mediaBundles || []),
                            {
                              bundleId: "bundle_" + Date.now(),
                              title: newBundleForm.title.trim(),
                              type: newBundleForm.type,
                              demoMediaUrl: newBundleForm.demoMediaUrl.trim(),
                              mediaItems: items,
                              priceRupees: newBundleForm.priceRupees,
                              productId: newBundleForm.productId.trim() || "bundle_exclusive_49",
                            }
                          ]
                        });
                        setNewBundleForm({ title: "", type: "photos", demoMediaUrl: "", mediaItemsText: "", priceRupees: 49, productId: "bundle_exclusive_49" });
                        setShowAddBundleForm(false);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-1.5 rounded-lg text-xs transition"
                    >
                      Save Bundle
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateHostModal(false)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !createHostForm.name}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg shadow-primary/20"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>{actionLoading ? "Creating..." : "Save & Create Host"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User / Host Profile Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0F0C20] flex justify-between items-center">
              <div className="flex items-center space-x-2 text-white">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="text-md font-bold text-white">Edit Profile & Privileges</h3>
              </div>
              <button
                onClick={() => setShowEditUserModal(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center space-x-4">
                <img
                  src={editUserForm.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover border-2 border-white/10 shadow-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={editUserForm.profilePhoto}
                    onChange={(e) => setEditUserForm({ ...editUserForm, profilePhoto: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editUserForm.name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Email / Phone</label>
                  <input
                    type="text"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Bio</label>
                <textarea
                  rows="2"
                  value={editUserForm.bio}
                  onChange={(e) => setEditUserForm({ ...editUserForm, bio: e.target.value })}
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Gender</label>
                  <select
                    value={editUserForm.gender}
                    onChange={(e) => setEditUserForm({ ...editUserForm, gender: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    value={editUserForm.country}
                    onChange={(e) => setEditUserForm({ ...editUserForm, country: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Role</label>
                  <select
                    value={editUserForm.role}
                    onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none font-bold"
                  >
                    <option value="user">User</option>
                    <option value="host">Host / Creator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Host Status</label>
                  <select
                    value={editUserForm.hostApplicationStatus}
                    onChange={(e) => setEditUserForm({ ...editUserForm, hostApplicationStatus: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Coin Balance</label>
                <input
                  type="number"
                  value={editUserForm.coinBalance}
                  onChange={(e) => setEditUserForm({ ...editUserForm, coinBalance: Number(e.target.value) })}
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="userBlockToggle"
                  checked={editUserForm.isBlocked}
                  onChange={(e) => setEditUserForm({ ...editUserForm, isBlocked: e.target.checked })}
                  className="rounded bg-[#0F0C20] border-white/10 text-red-500 focus:ring-0 h-4 w-4"
                />
                <label htmlFor="userBlockToggle" className="text-xs text-white/80 font-medium">
                  Block / Suspend this account
                </label>
              </div>

              {/* Host Gallery Photos */}
              <div className="bg-[#0F0C20] border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Image className="h-4 w-4 text-primary" />
                    <span>Host Gallery Photos</span>
                    <span className="text-primary font-normal text-[11px]">({(editUserForm.photos || []).length} / 10)</span>
                  </label>
                </div>

                {(editUserForm.photos || []).length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {(editUserForm.photos || []).map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-white/20 aspect-square bg-black/40">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setEditUserForm({
                            ...editUserForm,
                            photos: editUserForm.photos.filter((_, i) => i !== idx)
                          })}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 opacity-80 group-hover:opacity-100 transition"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={galleryInputUrl}
                    onChange={(e) => setGalleryInputUrl(e.target.value)}
                    placeholder="Paste Photo URL (https://...)"
                    className="flex-1 bg-[#161230] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!galleryInputUrl.trim()) return;
                      setEditUserForm({
                        ...editUserForm,
                        photos: [...(editUserForm.photos || []), galleryInputUrl.trim()]
                      });
                      setGalleryInputUrl("");
                    }}
                    className="bg-primary/20 hover:bg-primary border border-primary/40 text-primary hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>
              </div>

              {/* Romantic AI Persona */}
              <div className="bg-[#0F0C20] border border-white/10 rounded-xl p-3.5 space-y-2">
                <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span>Romantic AI Character Persona (OpenRouter)</span>
                </label>
                <textarea
                  rows="2"
                  value={editUserForm.aiPersona || ""}
                  onChange={(e) => setEditUserForm({ ...editUserForm, aiPersona: e.target.value })}
                  placeholder="Define the romantic flirting tone, affection, and chatting style..."
                  className="w-full bg-[#161230] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-primary"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditUserForm({ ...editUserForm, aiPersona: "Sweet, affectionate, soft-spoken romantic companion who loves cute pet names, deep conversations, and caring for you warmly." })}
                    className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg px-2 py-0.5 text-white/70 transition"
                  >
                    💖 Sweet & Romantic
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserForm({ ...editUserForm, aiPersona: "Playful, flirty, charming and witty companion who loves romantic teasing, playful banter, cute compliments, and intimate laughter." })}
                    className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg px-2 py-0.5 text-white/70 transition"
                  >
                    🔥 Flirty & Playful
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUserForm({ ...editUserForm, aiPersona: "Charismatic, seductive, confident and charming lover who speaks with allure, intense curiosity, and intimate emotional warmth." })}
                    className="text-[10px] bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg px-2 py-0.5 text-white/70 transition"
                  >
                    ✨ Seductive & Alluring
                  </button>
                </div>
              </div>

              {/* Exclusive Photo & Video Bundles (In-App Purchase Only) */}
              <div className="bg-[#0F0C20] border border-amber-500/20 rounded-xl p-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <Lock className="h-4 w-4 text-amber-400" />
                    <span>Exclusive Media Bundles (Real In-App Purchase Only)</span>
                    <span className="text-white/50 text-[11px]">({(editUserForm.mediaBundles || []).length} bundles)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddBundleForm(!showAddBundleForm)}
                    className="text-[11px] bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 transition flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{showAddBundleForm ? "Close Form" : "New Bundle"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-white/60">
                  AI smartly teases these bundles during conversations. Users can view the free demo media, but full items can only be unlocked via Google Play In-App Purchase (never ads).
                </p>

                {(editUserForm.mediaBundles || []).length > 0 && (
                  <div className="space-y-2">
                    {editUserForm.mediaBundles.map((b, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#161230] border border-white/10 rounded-xl p-2.5">
                        <div className="flex items-center space-x-3">
                          {b.demoMediaUrl ? (
                            <img src={b.demoMediaUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-amber-400/30" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xs text-white/50">No Demo</div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-white">{b.title}</span>
                              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{b.type}</span>
                            </div>
                            <div className="text-[11px] text-white/50 flex space-x-2">
                              <span>Demo Included</span>
                              <span>•</span>
                              <span>{(b.mediaItems || []).length} Locked Items</span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">₹{b.priceRupees || 49}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditUserForm({
                            ...editUserForm,
                            mediaBundles: editUserForm.mediaBundles.filter((_, i) => i !== idx)
                          })}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showAddBundleForm && (
                  <div className="bg-[#161230] border border-amber-500/30 rounded-xl p-3 space-y-2.5 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/60">Bundle Title</label>
                        <input
                          type="text"
                          value={newBundleForm.title}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, title: e.target.value })}
                          placeholder="e.g. Romantic Beach Diary"
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60">Bundle Type</label>
                        <select
                          value={newBundleForm.type}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, type: e.target.value })}
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        >
                          <option value="photos">Photo Album (Images)</option>
                          <option value="video">Exclusive Video</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Demo Preview Media URL (Free demo preview)</label>
                      <input
                        type="url"
                        value={newBundleForm.demoMediaUrl}
                        onChange={(e) => setNewBundleForm({ ...newBundleForm, demoMediaUrl: e.target.value })}
                        placeholder="https://... (1 image or video thumbnail)"
                        className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60">Locked Full Media URLs (Comma or newline separated)</label>
                      <textarea
                        rows="2"
                        value={newBundleForm.mediaItemsText}
                        onChange={(e) => setNewBundleForm({ ...newBundleForm, mediaItemsText: e.target.value })}
                        placeholder="https://image1.jpg, https://image2.jpg"
                        className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/60">Price in Rupees (₹)</label>
                        <input
                          type="number"
                          value={newBundleForm.priceRupees}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, priceRupees: Number(e.target.value) })}
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-white/60">Google Play Product ID</label>
                        <input
                          type="text"
                          value={newBundleForm.productId}
                          onChange={(e) => setNewBundleForm({ ...newBundleForm, productId: e.target.value })}
                          placeholder="bundle_photos_49"
                          className="w-full bg-[#0F0C20] border border-white/10 rounded-lg px-2.5 py-1 text-white text-xs"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newBundleForm.title.trim() || !newBundleForm.demoMediaUrl.trim()) {
                          return alert("Bundle title and demo media URL are required!");
                        }
                        const items = newBundleForm.mediaItemsText
                          .split(/[\n,]/)
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setEditUserForm({
                          ...editUserForm,
                          mediaBundles: [
                            ...(editUserForm.mediaBundles || []),
                            {
                              bundleId: "bundle_" + Date.now(),
                              title: newBundleForm.title.trim(),
                              type: newBundleForm.type,
                              demoMediaUrl: newBundleForm.demoMediaUrl.trim(),
                              mediaItems: items,
                              priceRupees: newBundleForm.priceRupees,
                              productId: newBundleForm.productId.trim() || "bundle_exclusive_49",
                            }
                          ]
                        });
                        setNewBundleForm({ title: "", type: "photos", demoMediaUrl: "", mediaItemsText: "", priceRupees: 49, productId: "bundle_exclusive_49" });
                        setShowAddBundleForm(false);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-1.5 rounded-lg text-xs transition"
                    >
                      Save Bundle
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg shadow-primary/20"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>{actionLoading ? "Updating..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Launch Live Stream Modal (YouTube / Shorts / MP4 Video / LiveKit) */}
      {showLaunchStreamModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#161230] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <header className="px-6 py-4 border-b border-white/10 bg-[#0F0C20] flex justify-between items-center">
              <div className="flex items-center space-x-2 text-red-500">
                <Radio className="h-5 w-5 animate-pulse" />
                <h3 className="text-md font-bold text-white">Launch Live Stream as Host</h3>
              </div>
              <button
                onClick={() => setShowLaunchStreamModal(false)}
                className="text-white/60 hover:text-white text-xl"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleStartSimulatedStream} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Select Host / Creator *</label>
                <select
                  value={launchStreamForm.hostId}
                  onChange={(e) => setLaunchStreamForm({ ...launchStreamForm, hostId: e.target.value })}
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 font-medium"
                  required
                >
                  <option value="">-- Choose a Host --</option>
                  {allHostsList.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.email})
                    </option>
                  ))}
                </select>
                {allHostsList.length === 0 && (
                  <span className="text-[10px] text-amber-400 mt-1 block">No approved hosts found. Please create a host first.</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Stream Source Engine</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "youtube", label: "🔴 YouTube / Shorts", desc: "Embed YouTube Live/Shorts" },
                    { id: "video_url", label: "🎬 Direct MP4 / HLS", desc: "Hosted Video URL loop" },
                    { id: "livekit", label: "📡 LiveKit WebRTC", desc: "Native LiveKit stream" }
                  ].map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => setLaunchStreamForm({ ...launchStreamForm, streamSourceType: src.id })}
                      className={`p-3 rounded-xl border text-left transition ${
                        launchStreamForm.streamSourceType === src.id
                          ? "bg-red-500/20 border-red-500 text-white shadow-md shadow-red-500/20"
                          : "bg-[#0F0C20] border-white/10 text-white/60 hover:bg-white/5"
                      }`}
                    >
                      <div className="font-bold text-xs">{src.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{src.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {launchStreamForm.streamSourceType !== "livekit" && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">
                    {launchStreamForm.streamSourceType === "youtube" ? "YouTube Live / Shorts / Video URL *" : "Direct MP4 / HLS Video URL *"}
                  </label>
                  <input
                    type="url"
                    value={launchStreamForm.streamUrl}
                    onChange={(e) => setLaunchStreamForm({ ...launchStreamForm, streamUrl: e.target.value })}
                    placeholder={
                      launchStreamForm.streamSourceType === "youtube"
                        ? "https://www.youtube.com/shorts/... or https://youtu.be/..."
                        : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                    }
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500 font-mono"
                    required
                  />
                  {launchStreamForm.streamSourceType === "youtube" && launchStreamForm.streamUrl && (
                    <div className="mt-2 p-2 bg-[#0F0C20] border border-white/5 rounded-xl flex items-center space-x-3">
                      <div className="text-[10px] text-emerald-400 font-semibold flex-1">
                        ✓ Stream will play directly in app feed with live chat & gift overlay!
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Broadcast Title *</label>
                <input
                  type="text"
                  value={launchStreamForm.title}
                  onChange={(e) => setLaunchStreamForm({ ...launchStreamForm, title: e.target.value })}
                  placeholder="e.g. 🔴 Friday Night Fun & Music!"
                  className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={launchStreamForm.category}
                    onChange={(e) => setLaunchStreamForm({ ...launchStreamForm, category: e.target.value })}
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Chat & Talk">Chat & Talk</option>
                    <option value="Music & Dance">Music & Dance</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Entertainment">Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">Description</label>
                  <input
                    type="text"
                    value={launchStreamForm.description}
                    onChange={(e) => setLaunchStreamForm({ ...launchStreamForm, description: e.target.value })}
                    placeholder="Join the live chat!"
                    className="w-full bg-[#0F0C20] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowLaunchStreamModal(false)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !launchStreamForm.hostId || !launchStreamForm.title}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center space-x-1.5 shadow-lg shadow-red-500/30"
                >
                  <Radio className="h-4 w-4" />
                  <span>{actionLoading ? "Starting Broadcast..." : "Go Live Now 🔴"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
