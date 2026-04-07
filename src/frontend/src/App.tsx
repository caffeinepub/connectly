import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Bookmark,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Flag,
  Forward,
  Hash,
  Heart,
  Home,
  Image,
  Loader2,
  LogOut,
  MapPin,
  Maximize,
  MessageCircle,
  Mic,
  MicOff,
  Minimize,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Music,
  Pause,
  PhoneCall,
  Pin,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Smile,
  Sparkles,
  Sticker,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User as UserIcon,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { type ReactElement, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type Page =
  | "home"
  | "search"
  | "reels"
  | "notifications"
  | "chat"
  | "profile"
  | "ai";

interface AppUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  posts: number;
  isPrivate?: boolean;
}

interface Post {
  id: number;
  user: AppUser;
  image: string;
  videoUrl?: string;
  type?: "image" | "reel";
  likes: number;
  caption: string;
  hashtags: string[];
  comments: number;
  commentList?: {
    id: number;
    text: string;
    username: string;
    replies?: { id: number; text: string; username: string }[];
  }[];
  time: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  location?: string;
  mood?: string;
  websiteLink?: string;
}

interface Story {
  id: number;
  user: AppUser;
  isCurrentUser?: boolean;
  seen?: boolean;
  image?: string;
  caption?: string;
  mentions?: string[];
  createdAt?: Date;
  likes?: number;
}

interface Notification {
  id: number;
  user: AppUser;
  type:
    | "like"
    | "follow"
    | "comment"
    | "mention"
    | "story_like"
    | "story_comment";
  text: string;
  time: string;
  read: boolean;
  postImage?: string;
}

interface Message {
  id: number;
  text: string;
  sent: boolean;
  time: string;
  reactions?: string[];
  read?: boolean;
  isTyping?: boolean;
  replyTo?: { id: number; text: string; sent: boolean };
  pinned?: boolean;
  saved?: boolean;
  unsent?: boolean;
  effect?: string;
  type?: "text" | "voice" | "image" | "post" | "sticker" | "note";
  noteData?: {
    kind: "song" | "note" | "location";
    title: string;
    subtitle?: string;
  };
  imageUrl?: string;
  duration?: string;
  postData?: {
    user: string;
    caption: string;
    likes: number;
    comments: number;
    gradient: string;
  };
}

interface Conversation {
  id: number;
  user: AppUser;
  messages: Message[];
  lastMessage: string;
  unread: number;
}

interface Reel {
  id: number;
  user: AppUser;
  image: string;
  videoUrl?: string;
  caption: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const CURRENT_USER: AppUser = {
  id: 0,
  name: "You",
  username: "yourhandle",
  avatar: "https://i.pravatar.cc/150?img=0",
  bio: "Living life one post at a time ✨ | Photography • Travel • Food",
  followers: 1248,
  following: 342,
  posts: 87,
  isPrivate: false,
};

// ─── PROFILE HOOK ─────────────────────────────────────────────────────────────

interface ProfileState {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  coverPhoto?: string;
  website?: string;
}

function useProfile() {
  const [profile, setProfile] = useState<ProfileState>(() => {
    try {
      const saved = localStorage.getItem("connectly_profile");
      if (saved) return JSON.parse(saved) as ProfileState;
    } catch {}
    return {
      name: CURRENT_USER.name,
      username: CURRENT_USER.username,
      bio: CURRENT_USER.bio ?? "",
      avatar: CURRENT_USER.avatar,
      coverPhoto: undefined,
      website: "",
    };
  });

  function updateProfile(patch: Partial<ProfileState>) {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem("connectly_profile", JSON.stringify(next));
      return next;
    });
  }

  return { profile, updateProfile };
}

// ─── EDIT PROFILE DIALOG ──────────────────────────────────────────────────────

function EditProfileDialog({
  open,
  onClose,
  profile,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  profile: ProfileState;
  onSave: (patch: Partial<ProfileState>) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [website, setWebsite] = useState(profile.website ?? "");
  const [coverPhoto, setCoverPhoto] = useState<string | undefined>(
    profile.coverPhoto,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setName(profile.name);
      setUsername(profile.username);
      setBio(profile.bio);
      setAvatar(profile.avatar);
      setWebsite(profile.website ?? "");
      setCoverPhoto(profile.coverPhoto);
    }
  }, [open, profile]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCoverPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    onSave({ name, username, bio, avatar, website, coverPhoto });
    toast.success("Profile saved!");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-sm rounded-2xl"
        style={{
          backgroundColor: "var(--app-card)",
          border: "1px solid var(--border)",
        }}
        data-ocid="edit_profile.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--app-text)" }}>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2 overflow-y-auto max-h-[80vh] pr-1">
          {/* Cover Photo */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-cover-photo"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              Cover Photo
            </label>
            <button
              type="button"
              id="edit-cover-photo"
              onClick={() => coverInputRef.current?.click()}
              className="relative w-full rounded-xl overflow-hidden border border-border hover:opacity-90 transition-opacity"
              style={{
                height: 64,
                background: coverPhoto
                  ? "transparent"
                  : "linear-gradient(135deg, #7c3aed, #f97316)",
              }}
              data-ocid="edit_profile.cover.upload_button"
            >
              {coverPhoto && (
                <img
                  src={coverPhoto}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Change Cover Photo
                </span>
              </div>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverFileChange}
            />
          </div>

          {/* Avatar picker */}
          <div className="flex justify-center">
            <button
              type="button"
              className="relative group"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="edit_profile.upload_button"
            >
              <div
                style={{
                  background:
                    "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  padding: 3,
                  borderRadius: "50%",
                }}
              >
                <div className="bg-background rounded-full p-1">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-name"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              Display Name
            </label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-lg"
              data-ocid="edit_profile.input"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-username"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              Username
            </label>
            <Input
              id="edit-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="rounded-lg"
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-bio"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              Description
            </label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              placeholder="अपने बारे में लिखें... (Describe yourself)"
              rows={4}
              className="rounded-lg resize-none"
              data-ocid="edit_profile.textarea"
            />
            <p
              className="text-xs text-right"
              style={{ color: "var(--app-text-muted)" }}
            >
              {bio.length}/300
            </p>
          </div>

          {/* Website */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="edit-website"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              🔗 Website / Link
            </label>
            <Input
              id="edit-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yoursite.com"
              className="rounded-lg"
              data-ocid="edit_profile.website.input"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onClose}
              data-ocid="edit_profile.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl text-white font-semibold"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
                border: "none",
              }}
              onClick={handleSave}
              data-ocid="edit_profile.save_button"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const USERS: AppUser[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    username: "sarahj",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Photographer & adventurer 📸 | NYC",
    followers: 12400,
    following: 892,
    posts: 234,
  },
  {
    id: 2,
    name: "Alex Chen",
    username: "alexchen",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Software engineer | Coffee addict ☕",
    followers: 8900,
    following: 410,
    posts: 156,
  },
  {
    id: 3,
    name: "Maria Garcia",
    username: "mariagarcia",
    avatar: "https://i.pravatar.cc/150?img=5",
    bio: "Chef & food blogger 🍕 | Madrid → LA",
    followers: 23100,
    following: 1200,
    posts: 412,
  },
  {
    id: 4,
    name: "James Wilson",
    username: "jameswilson",
    avatar: "https://i.pravatar.cc/150?img=8",
    bio: "Fitness coach | Motivation daily 💪",
    followers: 45600,
    following: 320,
    posts: 891,
  },
  {
    id: 5,
    name: "Emma Davis",
    username: "emmadavis",
    avatar: "https://i.pravatar.cc/150?img=9",
    bio: "Artist & designer 🎨 | Dream big",
    followers: 6700,
    following: 530,
    posts: 98,
  },
  {
    id: 6,
    name: "Ryan Lee",
    username: "ryanlee",
    avatar: "https://i.pravatar.cc/150?img=12",
    bio: "Travel vlogger ✈️ | 40+ countries",
    followers: 89000,
    following: 780,
    posts: 1240,
  },
];

const POSTS_INITIAL: Post[] = [
  {
    id: 1,
    user: USERS[0],
    image: "https://picsum.photos/seed/post1/600/400",
    likes: 1842,
    caption:
      "Golden hour magic at the peak. Nothing beats this view after a 3-hour hike!",
    hashtags: ["#hiking", "#nature", "#goldenhour", "#adventure"],
    comments: 94,
    commentList: [
      {
        id: 101,
        text: "Wow, what a view! 😍",
        username: "alex_adventures",
        replies: [
          {
            id: 1011,
            text: "Totally agree, been there last year!",
            username: "traveler_mia",
          },
          {
            id: 1012,
            text: "Which trail is this? I need to know! 🥾",
            username: "hiker_raj",
          },
        ],
      },
      {
        id: 102,
        text: "Goals! How long did the hike take?",
        username: "fit_priya",
        replies: [],
      },
    ],
    time: "2h ago",
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    user: USERS[2],
    image: "https://picsum.photos/seed/post2/600/400",
    likes: 3201,
    caption:
      "Made my grandma's secret paella recipe today. Took 4 hours but totally worth it 🥘",
    hashtags: ["#foodie", "#paella", "#homecooking", "#spain"],
    comments: 217,
    commentList: [
      {
        id: 201,
        text: "This looks absolutely delicious! 🤤",
        username: "foodie_sara",
        replies: [
          {
            id: 2011,
            text: "Right?! Would love the recipe!",
            username: "home_chef_dev",
          },
        ],
      },
      {
        id: 202,
        text: "Grandma's recipes always hit different ❤️",
        username: "nostalgia_vibes",
        replies: [],
      },
    ],
    time: "5h ago",
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 3,
    user: USERS[3],
    image: "https://picsum.photos/seed/post3/600/400",
    likes: 7450,
    caption:
      "Morning routine 5AM. Consistency is the key to transformation. Day 180 of daily workouts! 💪",
    hashtags: ["#fitness", "#motivation", "#morningroutine", "#consistency"],
    comments: 412,
    time: "8h ago",
    isLiked: false,
    isBookmarked: true,
  },
  {
    id: 4,
    user: USERS[5],
    image: "https://picsum.photos/seed/post4/600/400",
    likes: 2890,
    caption:
      "Bali doesn't disappoint. Found this hidden temple off the tourist trail. Pure magic ✨",
    hashtags: ["#bali", "#travel", "#temple", "#wanderlust"],
    comments: 156,
    time: "1d ago",
    isLiked: false,
    isBookmarked: false,
  },
];

const now = new Date();
const STORIES_INITIAL: Story[] = [
  {
    id: 0,
    user: CURRENT_USER,
    isCurrentUser: true,
    seen: false,
    createdAt: new Date(now.getTime() - 30 * 60 * 1000),
  },
  {
    id: 1,
    user: USERS[0],
    seen: false,
    image: "https://picsum.photos/seed/story1/400/700",
    caption: "Golden hour vibes ✨",
    mentions: ["@alex"],
    createdAt: new Date(now.getTime() - 45 * 60 * 1000),
  },
  {
    id: 2,
    user: USERS[1],
    seen: false,
    image: "https://picsum.photos/seed/story2/400/700",
    caption: "New track dropping soon 🎵",
    createdAt: new Date(now.getTime() - 90 * 60 * 1000),
  },
  {
    id: 3,
    user: USERS[2],
    seen: true,
    image: "https://picsum.photos/seed/story3/400/700",
    caption: "Cooking magic 🥘",
    createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
  },
  {
    id: 4,
    user: USERS[3],
    seen: false,
    image: "https://picsum.photos/seed/story4/400/700",
    caption: "Day 180 💪 feeling unstoppable!",
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
  },
  {
    id: 5,
    user: USERS[4],
    seen: false,
    image: "https://picsum.photos/seed/story5/400/700",
    caption: "Art in progress 🎨",
    createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
  },
  {
    id: 6,
    user: USERS[5],
    seen: true,
    image: "https://picsum.photos/seed/story6/400/700",
    caption: "Bali sunsets 🌅",
    createdAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
  },
];

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    user: USERS[0],
    type: "like",
    text: "liked your photo",
    time: "2m ago",
    read: false,
    postImage: "https://picsum.photos/seed/n1/60/60",
  },
  {
    id: 2,
    user: USERS[1],
    type: "follow",
    text: "started following you",
    time: "15m ago",
    read: false,
  },
  {
    id: 3,
    user: USERS[2],
    type: "comment",
    text: 'commented: "Absolutely stunning! 😍"',
    time: "1h ago",
    read: false,
    postImage: "https://picsum.photos/seed/n3/60/60",
  },
  {
    id: 4,
    user: USERS[3],
    type: "like",
    text: "liked your photo",
    time: "3h ago",
    read: true,
    postImage: "https://picsum.photos/seed/n4/60/60",
  },
  {
    id: 5,
    user: USERS[4],
    type: "mention",
    text: "mentioned you in a comment",
    time: "5h ago",
    read: true,
  },
  {
    id: 6,
    user: USERS[5],
    type: "follow",
    text: "started following you",
    time: "1d ago",
    read: true,
  },
  {
    id: 7,
    user: USERS[0],
    type: "comment",
    text: 'commented: "Where is this?! 🔥"',
    time: "2d ago",
    read: true,
    postImage: "https://picsum.photos/seed/n7/60/60",
  },
  {
    id: 8,
    user: USERS[2],
    type: "like",
    text: "liked your story",
    time: "3d ago",
    read: true,
  },
  {
    id: 9,
    user: USERS[3],
    type: "story_like",
    text: "liked your story ❤️",
    time: "30m ago",
    read: false,
  },
  {
    id: 10,
    user: USERS[1],
    type: "story_comment",
    text: 'commented on your story: "Amazing! 🔥"',
    time: "45m ago",
    read: false,
  },
];

const TRENDING_TAGS = [
  { tag: "#travel", posts: "2.4M" },
  { tag: "#photography", posts: "8.1M" },
  { tag: "#food", posts: "5.3M" },
  { tag: "#fitness", posts: "3.7M" },
  { tag: "#fashion", posts: "6.2M" },
  { tag: "#nature", posts: "4.5M" },
  { tag: "#music", posts: "1.9M" },
  { tag: "#art", posts: "2.1M" },
];

const CONVERSATIONS_INITIAL: Conversation[] = [
  {
    id: 1,
    user: USERS[0],
    unread: 2,
    lastMessage: "That hike looks incredible! 😍",
    messages: [
      {
        id: 1,
        text: "Hey! Love your recent posts!",
        sent: false,
        time: "10:00 AM",
      },
      {
        id: 2,
        text: "Thank you so much! Been traveling a lot lately",
        sent: true,
        time: "10:05 AM",
      },
      {
        id: 3,
        text: "That hike looks incredible! 😍",
        sent: false,
        time: "10:10 AM",
      },
    ],
  },
  {
    id: 2,
    user: USERS[2],
    unread: 0,
    lastMessage: "I'll send you the recipe!",
    messages: [
      {
        id: 1,
        text: "Can you share that paella recipe? It looked amazing",
        sent: true,
        time: "Yesterday",
      },
      {
        id: 2,
        text: "Of course! It's my grandma's secret though haha",
        sent: false,
        time: "Yesterday",
      },
      {
        id: 3,
        text: "I'll send you the recipe!",
        sent: false,
        time: "Yesterday",
      },
    ],
  },
  {
    id: 3,
    user: USERS[5],
    unread: 1,
    lastMessage: "Bali next month? Let's plan!",
    messages: [
      {
        id: 1,
        text: "Your Bali photos are insane 🌴",
        sent: true,
        time: "Mon",
      },
      { id: 2, text: "Thanks! You should visit", sent: false, time: "Mon" },
      { id: 3, text: "Bali next month? Let's plan!", sent: false, time: "Mon" },
    ],
  },
];

const REELS: Reel[] = [
  {
    id: 1,
    user: USERS[3],
    image: "https://picsum.photos/seed/reel1/400/700",
    caption: "Morning workout motivation 💪 Day 180!",
    likes: 45200,
    comments: 1230,
    isLiked: false,
  },
  {
    id: 2,
    user: USERS[5],
    image: "https://picsum.photos/seed/reel2/400/700",
    caption: "Hidden waterfall in Bali 🌊 Pure paradise",
    likes: 89400,
    comments: 3410,
    isLiked: true,
  },
  {
    id: 3,
    user: USERS[0],
    image: "https://picsum.photos/seed/reel3/400/700",
    caption: "Sunset timelapse from the mountain summit ⛰️",
    likes: 23100,
    comments: 890,
    isLiked: false,
  },
  {
    id: 4,
    user: USERS[2],
    image: "https://picsum.photos/seed/reel4/400/700",
    caption: "Cooking authentic Spanish paella from scratch 🥘",
    likes: 12800,
    comments: 540,
    isLiked: false,
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

// ─── CREATE STORY DIALOG ─────────────────────────────────────────────────────

function CreateStoryDialog({
  open,
  onClose,
  onShare,
}: {
  open: boolean;
  onClose: () => void;
  onShare: (story: {
    image?: string;
    caption?: string;
    mentions: string[];
  }) => void;
}) {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [caption, setCaption] = useState("");
  const [mentionInput, setMentionInput] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredUsers = USERS.filter(
    (u) =>
      mentionInput.length > 0 &&
      !mentions.includes(u.username) &&
      (u.name
        .toLowerCase()
        .includes(mentionInput.replace("@", "").toLowerCase()) ||
        u.username
          .toLowerCase()
          .includes(mentionInput.replace("@", "").toLowerCase())),
  );

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleMentionInput(val: string) {
    setMentionInput(val);
    setShowDropdown(val.includes("@") && val.length > 1);
  }

  function addMention(username: string) {
    setMentions((prev) => [...prev, username]);
    setMentionInput("");
    setShowDropdown(false);
  }

  function removeMention(username: string) {
    setMentions((prev) => prev.filter((m) => m !== username));
  }

  function handleShare() {
    onShare({ image, caption: caption.trim() || undefined, mentions });
    setImage(undefined);
    setCaption("");
    setMentionInput("");
    setMentions([]);
    onClose();
  }

  function handleClose() {
    setImage(undefined);
    setCaption("");
    setMentionInput("");
    setMentions([]);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        className="max-w-sm rounded-2xl p-0 overflow-hidden"
        style={{
          backgroundColor: "var(--app-card)",
          border: "1px solid var(--app-border)",
        }}
        data-ocid="create_story.dialog"
      >
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle style={{ color: "var(--app-text)" }}>
            Story बनाएं
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5 flex flex-col gap-4">
          {/* Image upload */}
          <button
            type="button"
            className="relative w-full aspect-[4/3] rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
            style={{
              backgroundColor: "var(--app-bg)",
              border: "2px dashed var(--app-border)",
            }}
            onClick={() => fileRef.current?.click()}
          >
            {image ? (
              <img
                src={image}
                alt="preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="w-8 h-8" />
                <span className="text-sm">Photo चुनें</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
              data-ocid="create_story.upload_button"
            />
          </button>

          {/* Caption */}
          <Textarea
            placeholder="Caption लिखें... (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={2}
            className="resize-none text-sm"
            style={{
              backgroundColor: "var(--app-bg)",
              color: "var(--app-text)",
              border: "1px solid var(--app-border)",
            }}
            data-ocid="create_story.textarea"
          />

          {/* Mention */}
          <div className="relative">
            <Input
              placeholder="@username mention करें"
              value={mentionInput}
              onChange={(e) => handleMentionInput(e.target.value)}
              onFocus={() => mentionInput.length > 1 && setShowDropdown(true)}
              className="text-sm"
              style={{
                backgroundColor: "var(--app-bg)",
                color: "var(--app-text)",
                border: "1px solid var(--app-border)",
              }}
              data-ocid="create_story.input"
            />
            {showDropdown && filteredUsers.length > 0 && (
              <div
                className="absolute left-0 right-0 top-full mt-1 rounded-xl overflow-hidden z-50 shadow-lg"
                style={{
                  backgroundColor: "var(--app-card)",
                  border: "1px solid var(--app-border)",
                }}
                data-ocid="create_story.dropdown_menu"
              >
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    className="flex items-center gap-3 w-full px-3 py-2 hover:bg-muted text-left"
                    onClick={() => addMention(u.username)}
                  >
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={u.avatar} alt={u.name} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--app-text)" }}
                      >
                        {u.name}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        @{u.username}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mention chips */}
          {mentions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mentions.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: "rgba(30,136,255,0.15)",
                    color: "#1E88FF",
                  }}
                >
                  @{m}
                  <button
                    type="button"
                    className="w-3 h-3 flex items-center justify-center rounded-full opacity-70 hover:opacity-100"
                    onClick={() => removeMention(m)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <Button
            type="button"
            onClick={handleShare}
            className="w-full font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #f97316)",
              border: "none",
            }}
            data-ocid="create_story.submit_button"
          >
            Story Share करें
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── STORY VIEWER ────────────────────────────────────────────────────────────

function StoryViewer({
  story,
  onClose,
  onSeen,
}: {
  story: Story;
  onClose: () => void;
  onSeen: (id: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    story.likes ?? Math.floor(Math.random() * 200) + 50,
  );
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showStoryShareSheet, setShowStoryShareSheet] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCloseRef = useRef(onClose);
  const onSeenRef = useRef(onSeen);
  onCloseRef.current = onClose;
  onSeenRef.current = onSeen;

  useEffect(() => {
    onSeenRef.current(story.id);
    setProgress(0);
    if (!showCommentInput) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(intervalRef.current!);
            onCloseRef.current();
            return 100;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [story.id, showCommentInput]);

  function getTimeAgo(date?: Date): string {
    if (!date) return "Just now";
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  function handleLike() {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }

  function handleShare() {
    setShowStoryShareSheet(true);
  }

  function handleSendComment() {
    if (!commentText.trim()) return;
    setCommentText("");
    setShowCommentInput(false);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.95)" }}
      data-ocid="story.modal"
    >
      <div className="relative w-full max-w-sm h-full max-h-[100dvh] flex flex-col">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 z-10 px-2 pt-2">
          <div className="w-full h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top overlay */}
        <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 mt-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-white">
              <AvatarImage src={story.user.avatar} alt={story.user.name} />
              <AvatarFallback>{story.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white text-sm font-semibold drop-shadow">
                {story.user.name}
              </p>
              <p className="text-white/70 text-xs">
                {getTimeAgo(story.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowStoryShareSheet(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40"
              data-ocid="story.secondary_button"
              aria-label="Share story"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={() => toast.success("Story saved to device! ⬇️")}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40"
              data-ocid="story.download_button"
              aria-label="Download story"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40"
              data-ocid="story.close_button"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Story image - tap zones */}
        <div className="relative flex-1 flex">
          <img
            src={
              story.image ||
              `https://picsum.photos/seed/story${story.id}/400/700`
            }
            alt="story"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Left tap zone */}
          <button
            type="button"
            className="absolute left-0 top-0 w-1/2 h-full z-10 opacity-0"
            onClick={onClose}
            data-ocid="story.secondary_button"
            aria-label="Previous story"
          />
          {/* Right tap zone */}
          <button
            type="button"
            className="absolute right-0 top-0 w-1/2 h-full z-10 opacity-0"
            onClick={onClose}
            data-ocid="story.primary_button"
            aria-label="Next story"
          />
        </div>

        {/* Bottom caption */}
        {(story.caption || (story.mentions && story.mentions.length > 0)) && (
          <div
            className="absolute left-0 right-0 z-10 px-4 py-3"
            style={{
              bottom: "80px",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            }}
          >
            {story.caption && (
              <p className="text-white text-sm mb-1">{story.caption}</p>
            )}
            {story.mentions && story.mentions.length > 0 && (
              <p className="text-blue-300 text-sm">
                {story.mentions.join(" ")}
              </p>
            )}
          </div>
        )}

        {/* Comment input */}
        {showCommentInput && (
          <div className="absolute bottom-16 left-0 right-0 z-20 px-3 pb-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Comment..."
                className="flex-1 bg-transparent text-white placeholder-white/50 text-sm outline-none"
                data-ocid="story.input"
              />
              <button
                type="button"
                onClick={handleSendComment}
                className="text-white/80 hover:text-white transition-colors"
                data-ocid="story.submit_button"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action bar */}
        <div
          className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-around px-6 py-3"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          }}
        >
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className="flex flex-col items-center gap-0.5 group"
            data-ocid="story.toggle"
          >
            <Heart
              className="w-6 h-6 transition-transform group-active:scale-125"
              style={{
                fill: liked ? "#ef4444" : "transparent",
                color: liked ? "#ef4444" : "white",
              }}
            />
            <span className="text-white text-xs">{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => setShowCommentInput((v) => !v)}
            className="flex flex-col items-center gap-0.5"
            data-ocid="story.secondary_button"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Comment</span>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-0.5 relative"
            data-ocid="story.primary_button"
          >
            <Send className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Share</span>
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={() => toast.success("Story saved to device! ⬇️")}
            className="flex flex-col items-center gap-0.5"
            data-ocid="story.download_button"
          >
            <Download className="w-6 h-6 text-white" />
            <span className="text-white text-xs">Save</span>
          </button>
        </div>
      </div>
      <GlobalShareSheet
        open={showStoryShareSheet}
        onClose={() => setShowStoryShareSheet(false)}
        title={`${story.user.name}'s Story`}
        url={window.location.href}
      />
    </div>
  );
}

// StoryAvatar
function StoryAvatar({
  story,
  onClick,
  isFollowed,
}: { story: Story; onClick: () => void; isFollowed?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0 group"
      data-ocid="stories.item"
    >
      <div
        className={`rounded-full p-[2px] ${
          story.isCurrentUser
            ? "bg-muted"
            : story.seen
              ? "bg-muted"
              : isFollowed === false
                ? "border-2 border-gray-400"
                : ""
        }`}
        style={
          !story.isCurrentUser && !story.seen && isFollowed !== false
            ? {
                background:
                  "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
              }
            : {}
        }
      >
        <div className="bg-background rounded-full p-[2px]">
          <div className="relative">
            <Avatar className="w-14 h-14">
              <AvatarImage src={story.user.avatar} alt={story.user.name} />
              <AvatarFallback>{story.user.name[0]}</AvatarFallback>
            </Avatar>
            {story.isCurrentUser && (
              <div
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#1E88FF" }}
              >
                <Plus className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="text-xs text-muted-foreground truncate w-16 text-center">
        {story.isCurrentUser ? "Your Story" : story.user.name.split(" ")[0]}
      </span>
    </button>
  );
}

// ─── AD CARD ──────────────────────────────────────────────────────────────────
const MOCK_ADS = [
  {
    id: "ad1",
    brand: "Trendify",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Trendify&backgroundColor=e91e8c&fontColor=ffffff",
    tagline: "Wear the Trend 🔥 New drops every week.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ctaLabel: "Shop Now",
    ctaUrl: "#",
  },
  {
    id: "ad2",
    brand: "StyleHub",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=StyleHub&backgroundColor=7c3aed&fontColor=ffffff",
    tagline: "Style Redefined ✨ Premium fashion at your fingertips.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    ctaLabel: "Explore",
    ctaUrl: "#",
  },
  {
    id: "ad3",
    brand: "ShopNow",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=ShopNow&backgroundColor=0891b2&fontColor=ffffff",
    tagline: "Best Deals Daily 🛍️ Unbeatable prices, everyday.",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    ctaLabel: "Get Offer",
    ctaUrl: "#",
  },
  {
    id: "ad4",
    brand: "VibeWear",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=VibeWear&backgroundColor=d97706&fontColor=ffffff",
    tagline: "Express Your Vibe 💫 Streetwear for the bold.",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ctaLabel: "Shop",
    ctaUrl: "#",
  },
  {
    id: "ad5",
    brand: "TechZone",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=TechZone&backgroundColor=1e3a5f&fontColor=ffffff",
    tagline: "Latest Gadgets 📱 Tech that powers your life.",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    ctaLabel: "Buy Now",
    ctaUrl: "#",
  },
  {
    id: "ad6",
    brand: "SoundBurst",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=SoundBurst&backgroundColor=16a34a&fontColor=ffffff",
    tagline: "Music for Every Mood 🎵 Unlimited streaming, zero limits.",
    image:
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
    ctaLabel: "Listen",
    ctaUrl: "#",
  },
];

function AdCard({ adIndex }: { adIndex: number }) {
  const ad = MOCK_ADS[adIndex % MOCK_ADS.length];
  return (
    <article
      className="overflow-hidden border-b"
      style={{
        backgroundColor: "var(--app-card)",
        borderColor: "var(--app-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={ad.brandAvatar} alt={ad.brand} />
            <AvatarFallback>{ad.brand[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--app-text)" }}
            >
              {ad.brand}
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              Sponsored · Demo Ad
            </p>
          </div>
        </div>
        <span
          className="text-xs px-2 py-0.5 rounded-full border"
          style={{
            color: "var(--app-accent)",
            borderColor: "var(--app-accent)",
            fontSize: "0.65rem",
          }}
        >
          Ad
        </span>
      </div>
      {/* Image */}
      <img
        src={ad.image}
        alt={ad.brand}
        className="w-full object-cover"
        style={{ maxHeight: 400 }}
      />
      {/* Body */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm flex-1" style={{ color: "var(--app-text)" }}>
          {ad.tagline}
        </p>
        <a
          href={ad.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full"
          style={{ backgroundColor: "var(--app-accent)", color: "#fff" }}
        >
          {ad.ctaLabel}
        </a>
      </div>
    </article>
  );
}

// ─── GLOBAL SHARE SHEET ──────────────────────────────────────────────────────

function GlobalShareSheet({
  open,
  onClose,
  title,
  url,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}) {
  const shareUrl = url || window.location.href;
  const shareTitle = title || "Check this out on Connectly!";

  const shareOptions = [
    {
      label: "WhatsApp",
      emoji: "💬",
      bg: "#25D366",
      color: "#fff",
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "WA Status",
      emoji: "📱",
      bg: "#075E54",
      color: "#fff",
      action: () => {
        toast.success("Added to WhatsApp Status! 📱");
        onClose();
      },
    },
    {
      label: "Instagram",
      emoji: "📸",
      bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
      color: "#fff",
      action: () => {
        toast.success("Opening Instagram... 📸");
        onClose();
      },
    },
    {
      label: "Twitter/X",
      emoji: "🐦",
      bg: "#000",
      color: "#fff",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "Facebook",
      emoji: "👍",
      bg: "#1877F2",
      color: "#fff",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "Telegram",
      emoji: "✈️",
      bg: "#229ED9",
      color: "#fff",
      action: () => {
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "Email",
      emoji: "📧",
      bg: "#6B7280",
      color: "#fff",
      action: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "SMS",
      emoji: "💌",
      bg: "#22C55E",
      color: "#fff",
      action: () => {
        window.open(
          `sms:?body=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "Copy Link",
      emoji: "🔗",
      bg: "#6B7280",
      color: "#fff",
      action: () => {
        navigator.clipboard?.writeText(shareUrl).catch(() => {});
        toast.success("Link copied! 🔗");
        onClose();
      },
    },
    {
      label: "Download",
      emoji: "⬇️",
      bg: "#F97316",
      color: "#fff",
      action: () => {
        const a = document.createElement("a");
        a.href = shareUrl;
        a.download = "connectly";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Downloaded! ⬇️");
        onClose();
      },
    },
    {
      label: "Google",
      emoji: "🔍",
      bg: "#fff",
      color: "#000",
      action: () => {
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(shareTitle)}`,
          "_blank",
        );
        onClose();
      },
    },
    {
      label: "Other Apps",
      emoji: "🌐",
      bg: "#374151",
      color: "#fff",
      action: () => {
        if (navigator.share) {
          navigator.share({ title: shareTitle, url: shareUrl }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(shareUrl).catch(() => {});
          toast.success("Link copied! Use browser to share 🌐");
        }
        onClose();
      },
    },
  ];

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      data-ocid="share.modal"
    >
      <div
        className="w-full max-w-lg rounded-t-3xl px-4 pt-4 pb-8"
        style={{ backgroundColor: "var(--app-card)" }}
      >
        <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
        <p
          className="text-center text-sm font-semibold mb-4"
          style={{ color: "var(--app-text)" }}
        >
          Share
        </p>
        <div className="grid grid-cols-4 gap-3 mb-4">
          {shareOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={opt.action}
              className="flex flex-col items-center gap-1.5"
              data-ocid="share.button"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                style={{
                  background: opt.bg,
                  color: opt.color,
                  border: opt.bg === "#fff" ? "1px solid #e5e7eb" : "none",
                }}
              >
                {opt.emoji}
              </div>
              <span
                className="text-xs text-center leading-tight"
                style={{ color: "var(--app-text-muted)" }}
              >
                {opt.label}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-semibold"
          style={{ backgroundColor: "var(--app-bg)", color: "var(--app-text)" }}
          data-ocid="share.cancel_button"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// PostCard
function PostCard({
  post,
  onLike,
  onBookmark,
  onComment,
  onOpenUserProfile,
  onNotInterested,
  onReported,
  followedUsers,
  onToggleFollow,
  favoritedPosts,
  onToggleFavorite,
}: {
  post: Post;
  onLike: (id: number) => void;
  onBookmark: (id: number) => void;
  onComment: (id: number, text: string) => void;
  onOpenUserProfile?: (user: AppUser) => void;
  onNotInterested?: (id: number) => void;
  onReported?: (id: number) => void;
  followedUsers?: Set<number>;
  onToggleFollow?: (id: number) => void;
  favoritedPosts?: Set<number>;
  onToggleFavorite?: (id: number) => void;
}) {
  const [likeScale, setLikeScale] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  // Nested replies state
  const [localComments, setLocalComments] = useState(post.commentList ?? []);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<
    Record<number, boolean>
  >({});
  const [showShareModal, setShowShareModal] = useState(false);
  // replyingToReply: { commentId, replyUsername } when replying to a reply
  const [_replyingToReply, setReplyingToReply] = useState<{
    commentId: number;
    replyUsername: string;
  } | null>(null);
  const [postInterest, setPostInterest] = useState<
    "interested" | "not_interested" | null
  >(null);
  const [postReported, setPostReported] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  function handleLike() {
    setLikeScale(true);
    onLike(post.id);
    setTimeout(() => setLikeScale(false), 200);
  }

  function handleShare() {
    setShowShareModal(true);
  }

  function handleSubmitComment() {
    if (!commentInput.trim()) return;
    onComment(post.id, commentInput.trim());
    const newComment = {
      id: Date.now(),
      text: commentInput.trim(),
      username: "you",
      replies: [],
    };
    setLocalComments((prev) => [...prev, newComment]);
    setCommentInput("");
  }

  function handleStartReply(commentId: number, username: string) {
    setReplyingTo(commentId);
    setReplyInputs((prev) => ({ ...prev, [commentId]: `@${username} ` }));
  }

  function handleSubmitReply(commentId: number) {
    const text = replyInputs[commentId]?.trim();
    if (!text) return;
    const newReply = { id: Date.now(), text, username: "you" };
    setLocalComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...(c.replies ?? []), newReply] }
          : c,
      ),
    );
    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    setReplyingTo(null);
    setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
  }

  return (
    <article
      className="overflow-hidden border-b"
      style={{
        backgroundColor: "var(--app-card)",
        borderColor: "var(--app-border)",
      }}
      data-ocid={`feed.item.${post.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          className="flex items-center gap-3 active:opacity-70 transition-opacity"
          onClick={() => onOpenUserProfile?.(post.user)}
          data-ocid={`feed.item.${post.id}.link`}
        >
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--app-text)" }}
            >
              {post.user.name}
            </p>
            <p
              className="text-xs opacity-50"
              style={{ color: "var(--app-text-muted)" }}
            >
              {post.time}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {post.user.id !== 0 && (
            <button
              type="button"
              onClick={() => onToggleFollow?.(post.user.id)}
              className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
              style={{
                borderColor: followedUsers?.has(post.user.id)
                  ? "var(--app-border)"
                  : "var(--app-accent)",
                color: followedUsers?.has(post.user.id)
                  ? "var(--app-text-muted)"
                  : "var(--app-accent)",
              }}
              data-ocid={`feed.item.${post.id}.follow_button`}
            >
              {followedUsers?.has(post.user.id) ? "Following" : "Follow"}
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-muted active:scale-95 transition-transform duration-150"
                style={{ color: "var(--app-text-muted)" }}
                data-ocid={`feed.item.${post.id}.button`}
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => {
                  setPostInterest("interested");
                  toast.success("👍 इस post में interest mark किया");
                }}
                className={
                  postInterest === "interested"
                    ? "text-green-500 font-semibold"
                    : ""
                }
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Interested
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setPostInterest("not_interested");
                  toast("👎 इस तरह के posts कम दिखाए जाएंगे");
                  setTimeout(() => onNotInterested?.(post.id), 500);
                }}
                className={
                  postInterest === "not_interested"
                    ? "text-red-500 font-semibold"
                    : ""
                }
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Not Interested
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (!postReported) {
                    setPostReported(true);
                    toast("🚩 Report submit हो गया, हम इसे review करेंगे।");
                    setTimeout(() => onReported?.(post.id), 500);
                  }
                }}
                className={
                  postReported ? "text-red-500 font-semibold" : "text-red-400"
                }
              >
                {postReported ? (
                  <span className="flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Reported
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </span>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = post.image;
                  a.download = "post.jpg";
                  a.click();
                  toast.success("⬇️ Download शुरू हुआ!");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast("🔀 Remix feature आ रहा है जल्द ही!")}
              >
                <Forward className="w-4 h-4 mr-2" />
                Remix
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleFavorite?.(post.id)}
                className={
                  favoritedPosts?.has(post.id) ? "text-yellow-500" : ""
                }
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {favoritedPosts?.has(post.id)
                  ? "Favorited ★"
                  : "Add to Favorites"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast("🙈 Post hide हो गया");
                  setTimeout(() => onNotInterested?.(post.id), 500);
                }}
              >
                <VolumeX className="w-4 h-4 mr-2" />
                Hide
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAboutModal(true)}>
                <UserIcon className="w-4 h-4 mr-2" />
                About this account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowQRModal(true)}>
                <Hash className="w-4 h-4 mr-2" />
                QR Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowWhyModal(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                Why you're seeing this
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => toast.success("Post added to your story! 📖")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Add to Story
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Media: image or video */}
      {post.type === "reel" && post.videoUrl ? (
        <video
          src={post.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="w-full object-cover"
          style={{ maxHeight: 400 }}
        />
      ) : (
        <img
          src={post.image}
          alt="post"
          className="w-full object-cover"
          style={{ maxHeight: 400 }}
        />
      )}
      {/* Actions */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={handleLike}
              data-ocid={`feed.item.${post.id}.toggle`}
              className="active:scale-95 transition-transform duration-150 p-1 -m-1"
              style={{
                transform: likeScale ? "scale(1.3)" : "scale(1)",
                transition: "transform 0.15s",
              }}
            >
              <Heart
                className="w-6 h-6"
                style={{
                  color: post.isLiked ? "#E53935" : "var(--app-text)",
                  fill: post.isLiked ? "#E53935" : "none",
                }}
              />
            </button>
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="hover:opacity-70 active:scale-95 transition-transform duration-150 p-1 -m-1"
              data-ocid={`feed.item.${post.id}.open_modal_button`}
            >
              <MessageCircle
                className="w-6 h-6"
                style={{
                  color: showComments ? "var(--app-accent)" : "var(--app-text)",
                }}
              />
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="hover:opacity-70 active:scale-95 transition-transform duration-150 p-1 -m-1"
              data-ocid={`feed.item.${post.id}.secondary_button`}
            >
              <Send className="w-6 h-6" style={{ color: "var(--app-text)" }} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onBookmark(post.id)}
            data-ocid={`feed.item.${post.id}.save_button`}
          >
            <Bookmark
              className="w-6 h-6"
              style={{
                color: post.isBookmarked
                  ? "var(--app-accent)"
                  : "var(--app-text)",
                fill: post.isBookmarked ? "var(--app-accent)" : "none",
              }}
            />
          </button>
        </div>
        <p
          className="text-sm font-bold mb-1"
          style={{ color: "var(--app-text)" }}
        >
          {formatCount(post.likes + (post.isLiked ? 1 : 0))} likes
        </p>
        <p className="text-sm" style={{ color: "var(--app-text)" }}>
          <span className="font-bold">{post.user.username}</span> {post.caption}
        </p>
        {(post.location || post.mood) && (
          <div className="flex flex-wrap gap-2 mt-0.5">
            {post.location && (
              <span
                className="text-xs"
                style={{ color: "var(--app-text-muted)" }}
              >
                📍 {post.location}
              </span>
            )}
            {post.mood && (
              <span
                className="text-xs"
                style={{ color: "var(--app-text-muted)" }}
              >
                {post.mood}
              </span>
            )}
          </div>
        )}
        {post.websiteLink && (
          <a
            href={post.websiteLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium mt-0.5"
            style={{
              borderColor: "var(--app-accent)",
              color: "var(--app-accent)",
            }}
            data-ocid={`feed.item.${post.id}.link`}
          >
            🔗 {post.websiteLink.replace(/^https?:\/\//, "").slice(0, 35)}
          </a>
        )}
        <p className="text-sm mt-0.5" style={{ color: "var(--app-accent)" }}>
          {post.hashtags.join(" ")}
        </p>
        <button
          type="button"
          onClick={() => setShowComments((v) => !v)}
          className="text-xs mt-1"
          style={{ color: "var(--app-text-muted)" }}
          data-ocid={`feed.item.${post.id}.link`}
        >
          {localComments.length > 0
            ? `View all ${localComments.length} comments`
            : post.comments > 0
              ? `View all ${post.comments} comments`
              : "Add a comment..."}
        </button>

        {/* Inline Comments Section */}
        {showComments && (
          <div
            className="mt-3 flex flex-col gap-3"
            data-ocid={`feed.item.${post.id}.panel`}
          >
            {localComments.map((c, i) => (
              <div key={c.id} data-ocid={`feed.item.${post.id}.item.${i + 1}`}>
                {/* Comment row */}
                <div className="flex gap-2 items-start">
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-xs font-semibold mr-1.5"
                      style={{ color: "var(--app-text)" }}
                    >
                      {c.username}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--app-text)" }}
                    >
                      {c.text}
                    </span>
                    {/* Reply button */}
                    <div className="flex items-center gap-3 mt-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          replyingTo === c.id
                            ? setReplyingTo(null)
                            : handleStartReply(c.id, c.username)
                        }
                        className="text-[10px] font-medium leading-none"
                        style={{ color: "var(--app-text-muted)" }}
                        data-ocid={`feed.item.${post.id}.secondary_button`}
                      >
                        {replyingTo === c.id ? "Cancel" : "Reply"}
                      </button>
                      {(c.replies?.length ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedReplies((prev) => ({
                              ...prev,
                              [c.id]: !prev[c.id],
                            }))
                          }
                          className="text-[10px] font-medium leading-none"
                          style={{ color: "var(--app-accent)" }}
                        >
                          {expandedReplies[c.id]
                            ? "Hide replies"
                            : `View ${c.replies!.length} ${c.replies!.length === 1 ? "reply" : "replies"}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Existing replies */}
                {expandedReplies[c.id] && (c.replies?.length ?? 0) > 0 && (
                  <div
                    className="ml-7 mt-1.5 flex flex-col gap-1.5 border-l pl-3"
                    style={{ borderColor: "var(--app-border)" }}
                  >
                    {c.replies!.map((r) => (
                      <div key={r.id} className="flex flex-col gap-0.5">
                        <div className="flex gap-1.5 items-start flex-wrap">
                          <span
                            className="text-[11px] font-semibold mr-1"
                            style={{ color: "var(--app-text)" }}
                          >
                            {r.username}
                          </span>
                          <span
                            className="text-[11px]"
                            style={{ color: "var(--app-text)" }}
                          >
                            {r.text}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingToReply({
                              commentId: c.id,
                              replyUsername: r.username,
                            });
                            setReplyingTo(c.id);
                            setReplyInputs((prev) => ({
                              ...prev,
                              [c.id]: `@${r.username} `,
                            }));
                          }}
                          className="text-[10px] font-medium leading-none self-start"
                          style={{ color: "var(--app-text-muted)" }}
                          data-ocid={`feed.item.${post.id}.secondary_button`}
                        >
                          Reply
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                {replyingTo === c.id && (
                  <div className="ml-7 mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyInputs[c.id] ?? ""}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({
                          ...prev,
                          [c.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSubmitReply(c.id)
                      }
                      placeholder={`Reply to @${c.username}...`}
                      className="flex-1 text-[11px] px-2.5 py-1 rounded-full outline-none border"
                      style={{
                        backgroundColor: "var(--app-bg)",
                        borderColor: "var(--app-border)",
                        color: "var(--app-text)",
                      }}
                      data-ocid={`feed.item.${post.id}.input`}
                    />
                    <button
                      type="button"
                      onClick={() => handleSubmitReply(c.id)}
                      disabled={!replyInputs[c.id]?.trim()}
                      className="text-[11px] px-2.5 py-1 rounded-full font-semibold text-white disabled:opacity-40"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #f97316)",
                      }}
                    >
                      Post
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                placeholder="Comment लिखें..."
                className="flex-1 text-xs px-3 py-1.5 rounded-full outline-none border"
                style={{
                  backgroundColor: "var(--app-bg)",
                  borderColor: "var(--app-border)",
                  color: "var(--app-text)",
                }}
                data-ocid={`feed.item.${post.id}.input`}
              />
              <button
                type="button"
                onClick={handleSubmitComment}
                disabled={!commentInput.trim()}
                className="text-xs px-3 py-1.5 rounded-full font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #f97316)",
                }}
                data-ocid={`feed.item.${post.id}.submit_button`}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
      <GlobalShareSheet
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={`Check out this post by @${post.user.username}`}
        url={`https://connectly.app/post/${post.id}`}
      />

      {/* About this Account Modal */}
      <Dialog open={showAboutModal} onOpenChange={setShowAboutModal}>
        <DialogContent
          className="max-w-sm rounded-2xl"
          data-ocid="feed.about.dialog"
        >
          <DialogHeader>
            <DialogTitle>About this account</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-2">
            <Avatar className="w-16 h-16">
              <AvatarImage src={post.user.avatar} alt={post.user.name} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p
                className="font-semibold text-base"
                style={{ color: "var(--app-text)" }}
              >
                {post.user.name}
              </p>
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                @{post.user.username}
              </p>
            </div>
            <div className="w-full flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--app-text-muted)" }}>Joined</span>
                <span style={{ color: "var(--app-text)" }}>January 2022</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--app-text-muted)" }}>
                  Followers
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--app-text)" }}
                >
                  {post.user.followers?.toLocaleString() ?? "0"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--app-text-muted)" }}>Location</span>
                <span style={{ color: "var(--app-text)" }}>India</span>
              </div>
              <p
                className="text-xs mt-2"
                style={{ color: "var(--app-text-muted)" }}
              >
                This account has been on Connectly since January 2022.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent
          className="max-w-sm rounded-2xl"
          data-ocid="feed.qr.dialog"
        >
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(15, 1fr)",
                width: 150,
                height: 150,
                gap: 2,
                background: "white",
                padding: 8,
                borderRadius: 8,
              }}
            >
              {(() => {
                const qrCells: ReactElement[] = [];
                for (let qIdx = 0; qIdx < 225; qIdx++) {
                  const r = Math.floor(qIdx / 15);
                  const c = qIdx % 15;
                  const isCorner =
                    (r < 3 && c < 3) || (r < 3 && c > 11) || (r > 11 && c < 3);
                  const isInner =
                    (r === 1 && c === 1) ||
                    (r === 1 && c === 13) ||
                    (r === 13 && c === 1);
                  const filled =
                    isCorner ||
                    (!isInner && (r * 3 + c * 7 + post.user.id) % 3 !== 0);
                  qrCells.push(
                    <div
                      key={`qr-cell-${r}-${c}`}
                      style={{
                        background: filled ? "#000" : "transparent",
                        borderRadius: isCorner ? 2 : 0,
                      }}
                    />,
                  );
                }
                return qrCells;
              })()}
            </div>
            <div className="text-center">
              <p className="font-semibold" style={{ color: "var(--app-text)" }}>
                @{post.user.username}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--app-text-muted)" }}
              >
                Scan to visit @{post.user.username}'s profile
              </p>
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={() => toast.success("📋 QR Code copied!")}
              data-ocid="feed.qr.primary_button"
            >
              Share QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Why You're Seeing This Modal */}
      <Dialog open={showWhyModal} onOpenChange={setShowWhyModal}>
        <DialogContent
          className="max-w-sm rounded-2xl"
          data-ocid="feed.why.dialog"
        >
          <DialogHeader>
            <DialogTitle>Why you're seeing this post</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-start gap-2 text-sm">
              <span>👥</span>
              <p style={{ color: "var(--app-text)" }}>
                You follow @{post.user.username}
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span>🌍</span>
              <p style={{ color: "var(--app-text)" }}>
                This post is popular in your area
              </p>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span>✨</span>
              <p style={{ color: "var(--app-text)" }}>
                Based on your interests and activity
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl text-sm"
                onClick={() => {
                  setShowWhyModal(false);
                  toast("👎 इस तरह के posts कम दिखाए जाएंगे");
                  setTimeout(() => onNotInterested?.(post.id), 500);
                }}
                data-ocid="feed.why.secondary_button"
              >
                Not Interested
              </Button>
              <Button
                className="flex-1 rounded-xl text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #f97316)",
                  border: "none",
                }}
                onClick={() => {
                  setShowWhyModal(false);
                  toast("⚙️ Preferences updated!");
                }}
                data-ocid="feed.why.primary_button"
              >
                Manage Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

function HomePage({
  posts,
  onLike,
  onBookmark,
  onComment,
  stories,
  onAddStory,
  followedUsers,
  onOpenUserProfile,
  onToggleFollow,
}: {
  posts: Post[];
  onLike: (id: number) => void;
  onBookmark: (id: number) => void;
  onComment: (id: number, text: string) => void;
  stories: Story[];
  onAddStory: (story: {
    image?: string;
    caption?: string;
    mentions: string[];
  }) => void;
  followedUsers: Set<number>;
  onOpenUserProfile?: (user: AppUser) => void;
  onToggleFollow?: (id: number) => void;
}) {
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [hiddenPosts, setHiddenPosts] = useState<
    Map<number, "not_interested" | "reported">
  >(new Map());
  const [hiddenSectionOpen, setHiddenSectionOpen] = useState(false);
  const [favoritedPosts, setFavoritedPosts] = useState<Set<number>>(new Set());
  const hiddenPostIds = new Set(hiddenPosts.keys());
  const visiblePosts = posts.filter((p) => !hiddenPostIds.has(p.id));

  const visibleStories = stories.filter((s) => {
    if (s.isCurrentUser) return true;
    const withinDay =
      !s.createdAt || Date.now() - s.createdAt.getTime() < 24 * 60 * 60 * 1000;
    return withinDay;
  });

  return (
    <div className="flex flex-col pb-4" data-ocid="home.page">
      <CreateStoryDialog
        open={createStoryOpen}
        onClose={() => setCreateStoryOpen(false)}
        onShare={(data) => {
          onAddStory(data);
          toast.success("Story shared! 🎉");
        }}
      />
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
          onSeen={(_id) => {
            // Mark as seen via parent or local state
            setViewingStory(null);
          }}
        />
      )}
      {/* Stories */}
      <div
        className="border-b px-4 py-3"
        style={{
          backgroundColor: "var(--app-card)",
          borderColor: "var(--app-border)",
        }}
      >
        <div className="flex gap-4 overflow-x-auto" data-ocid="stories.panel">
          {visibleStories.map((story) => (
            <StoryAvatar
              key={story.id}
              story={story}
              isFollowed={
                story.isCurrentUser
                  ? undefined
                  : followedUsers.has(story.user.id)
              }
              onClick={
                story.isCurrentUser
                  ? () => setCreateStoryOpen(true)
                  : () => setViewingStory(story)
              }
            />
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex flex-col" data-ocid="feed.list">
        {visiblePosts.flatMap((post, i) => {
          const cards = [
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onBookmark={onBookmark}
              onComment={onComment}
              onOpenUserProfile={onOpenUserProfile}
              onNotInterested={(id) =>
                setHiddenPosts(
                  (prev) => new Map([...prev, [id, "not_interested"]]),
                )
              }
              onReported={(id) =>
                setHiddenPosts((prev) => new Map([...prev, [id, "reported"]]))
              }
              followedUsers={followedUsers}
              onToggleFollow={onToggleFollow}
              favoritedPosts={favoritedPosts}
              onToggleFavorite={(id) => {
                setFavoritedPosts((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) {
                    next.delete(id);
                    toast("⭐ Favorites से हटाया");
                  } else {
                    next.add(id);
                    toast.success("⭐ Favorites में add किया!");
                  }
                  return next;
                });
              }}
            />,
          ];
          if ((i + 1) % 3 === 0) {
            cards.push(
              <AdCard key={`ad-${post.id}`} adIndex={Math.floor(i / 3)} />,
            );
          }
          return cards;
        })}
      </div>

      {/* Hidden Posts Section */}
      {hiddenPosts.size > 0 && (
        <div
          className="mx-0 mt-2 rounded-none border-t"
          style={{ borderColor: "var(--app-border)" }}
          data-ocid="hidden_posts.panel"
        >
          <button
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
            style={{ color: "var(--app-text-muted)" }}
            onClick={() => setHiddenSectionOpen((v) => !v)}
            type="button"
            data-ocid="hidden_posts.toggle"
          >
            <span>🙈 Hidden Posts ({hiddenPosts.size})</span>
            <span>{hiddenSectionOpen ? "▲" : "▼"}</span>
          </button>
          {hiddenSectionOpen && (
            <div
              className="flex flex-col divide-y"
              style={{ borderColor: "var(--app-border)" }}
            >
              {posts
                .filter((p) => hiddenPostIds.has(p.id))
                .map((post) => {
                  const reason = hiddenPosts.get(post.id);
                  return (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 px-4 py-3"
                      style={{ backgroundColor: "var(--app-card)" }}
                      data-ocid={`hidden_posts.item.${post.id}`}
                    >
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-semibold truncate"
                            style={{ color: "var(--app-text)" }}
                          >
                            {post.user.name}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor:
                                reason === "reported"
                                  ? "oklch(0.92 0.05 25)"
                                  : "oklch(0.93 0.02 240)",
                              color:
                                reason === "reported"
                                  ? "oklch(0.45 0.15 25)"
                                  : "oklch(0.45 0.05 240)",
                            }}
                          >
                            {reason === "reported"
                              ? "Reported"
                              : "Not Interested"}
                          </span>
                        </div>
                        {post.caption && (
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--app-text-muted)" }}
                          >
                            {post.caption}
                          </p>
                        )}
                      </div>
                      {post.image && (
                        <img
                          src={post.image}
                          alt=""
                          className="h-10 w-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <button
                        className="flex-shrink-0 rounded border px-2.5 py-1 text-xs font-medium"
                        style={{
                          borderColor: "var(--app-border)",
                          color: "var(--app-text)",
                        }}
                        onClick={() =>
                          setHiddenPosts((prev) => {
                            const next = new Map(prev);
                            next.delete(post.id);
                            return next;
                          })
                        }
                        type="button"
                        data-ocid="hidden_posts.restore_button"
                      >
                        Restore
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SEARCH PAGE ──────────────────────────────────────────────────────────────

function SearchPage({
  followedUsers,
  setFollowedUsers,
  stories,
  onOpenUserProfile,
}: {
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
  stories: Story[];
  onOpenUserProfile?: (user: AppUser) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "people" | "tags">("top");
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  // followed state is now managed by App (followedUsers/setFollowedUsers)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("connectly_recent_searches") || "[]",
      );
    } catch {
      return [];
    }
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxImg, setLightboxImg] = useState<{
    image: string;
    likes: number;
    username: string;
    caption: string;
    commentCount: number;
    isLiked: boolean;
    isSaved?: boolean;
    isFollowing?: boolean;
  } | null>(null);
  const [lightboxComment, setLightboxComment] = useState("");
  const [showLightboxShare, setShowLightboxShare] = useState(false);

  function saveSearch(q: string) {
    if (!q.trim()) return;
    setRecentSearches((prev) => {
      const updated = [q, ...prev.filter((s) => s !== q)].slice(0, 5);
      localStorage.setItem(
        "connectly_recent_searches",
        JSON.stringify(updated),
      );
      return updated;
    });
  }

  function removeRecent(s: string) {
    setRecentSearches((prev) => {
      const updated = prev.filter((x) => x !== s);
      localStorage.setItem(
        "connectly_recent_searches",
        JSON.stringify(updated),
      );
      return updated;
    });
  }

  function clearAllRecent() {
    setRecentSearches([]);
    localStorage.removeItem("connectly_recent_searches");
  }

  const CATEGORIES = [
    "All",
    "🌄 Travel",
    "🍕 Food",
    "🎨 Art",
    "💪 Fitness",
    "🐾 Pets",
    "📸 Photography",
  ];

  const filteredUsers = USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.username.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredTags = TRENDING_TAGS.filter((t) =>
    t.tag.toLowerCase().includes(query.toLowerCase()),
  );

  // Masonry explore images with category seed
  const categoryIndex = CATEGORIES.indexOf(selectedCategory);
  const MASONRY_CAPTIONS = [
    "Golden hour never gets old 🌄 #travel #photography",
    "Living for these moments ✨ #lifestyle #vibes",
    "Adventures await around every corner 🗺️ #explore",
    "Savoring every bite 🍕 #foodie #delicious",
    "City lights and late nights 🌃 #urban #nightlife",
    "Finding peace in nature 🌿 #outdoors #calm",
    "Art is everywhere if you look 🎨 #art #creative",
    "Sunrise motivation 💪 #fitness #morningroutine",
    "These streets have stories 📸 #photography #street",
    "Weekend mood: unbothered 🐾 #pets #relaxing",
    "Chasing sunsets and good vibes 🌅 #sunset #travel",
    "Creating memories one frame at a time 📷 #moments",
  ];
  const MASONRY_COMMENTS = [
    [
      { u: "alex_m", t: "Absolutely stunning! 😍" },
      { u: "priya_k", t: "Love this so much ❤️" },
      { u: "raj_s", t: "Where is this??" },
    ],
    [
      { u: "neha_v", t: "Goals! 🙌" },
      { u: "mike_t", t: "This is incredible!" },
    ],
    [
      { u: "sara_j", t: "Perfect shot 📸" },
      { u: "david_l", t: "Adding to my bucket list!" },
      { u: "aisha_r", t: "So beautiful 💫" },
    ],
    [
      { u: "john_d", t: "Yummy! 😋" },
      { u: "maya_p", t: "Recipe please??" },
    ],
    [
      { u: "chris_w", t: "Love the vibes ✨" },
      { u: "tanya_b", t: "Fire photo! 🔥" },
      { u: "sam_k", t: "Night life goals 🌃" },
    ],
    [
      { u: "kavya_r", t: "So serene 🌿" },
      { u: "arjun_m", t: "Nature therapy ❤️" },
    ],
    [
      { u: "elena_v", t: "Artistic masterpiece! 🎨" },
      { u: "raj_s", t: "Wow just wow!" },
      { u: "priya_k", t: "Your talent 😭🙌" },
    ],
    [
      { u: "tom_h", t: "Inspired! 💪" },
      { u: "nina_s", t: "Morning goals!" },
    ],
    [
      { u: "alex_m", t: "Street photography done right!" },
      { u: "maya_p", t: "This composition 👌" },
      { u: "david_l", t: "Cinematic!" },
    ],
    [
      { u: "neha_v", t: "Cuteness overload 🐾" },
      { u: "john_d", t: "Best vibes ever" },
    ],
    [
      { u: "aisha_r", t: "Magical 🌅" },
      { u: "chris_w", t: "Chasing the same skies!" },
      { u: "tanya_b", t: "Nature is art 💛" },
    ],
    [
      { u: "sam_k", t: "Timeless 📷" },
      { u: "kavya_r", t: "Captured perfectly!" },
    ],
  ];
  const masonryImages = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    image: `https://picsum.photos/seed/explore${categoryIndex * 12 + i + 1}/400/500`,
    squareImage: `https://picsum.photos/seed/explore${categoryIndex * 12 + i + 1}/400/400`,
    likes: Math.floor((i + 1 + categoryIndex * 3) * 731 + 500),
    username: USERS[i % USERS.length].username,
    tall: i % 3 !== 2,
    caption: MASONRY_CAPTIONS[i % MASONRY_CAPTIONS.length],
    commentCount: MASONRY_COMMENTS[i % MASONRY_COMMENTS.length].length,
    mockComments: MASONRY_COMMENTS[i % MASONRY_COMMENTS.length],
  }));

  const tabs = [
    { id: "top" as const, label: "🔍 Top" },
    { id: "people" as const, label: "👤 People" },
    { id: "tags" as const, label: "#️⃣ Tags" },
  ];

  return (
    <div className="flex flex-col gap-4 pb-4" data-ocid="search.page">
      {viewingStory && (
        <StoryViewer
          story={viewingStory}
          onClose={() => setViewingStory(null)}
          onSeen={() => setViewingStory(null)}
        />
      )}
      <Input
        placeholder="Search people, tags..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && saveSearch(query)}
        className="rounded-full border-border h-11 px-5"
        style={{ backgroundColor: "var(--app-card)", color: "var(--app-text)" }}
        data-ocid="search.search_input"
      />

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--app-text)" }}
            >
              Recent
            </h2>
            <button
              type="button"
              onClick={clearAllRecent}
              className="text-xs"
              style={{ color: "var(--app-accent)" }}
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {recentSearches.map((s) => (
              <div
                key={s}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ backgroundColor: "var(--app-card)" }}
              >
                <button
                  type="button"
                  onClick={() => setQuery(s)}
                  className="text-sm flex-1 text-left"
                  style={{ color: "var(--app-text)" }}
                >
                  {s}
                </button>
                <button
                  type="button"
                  onClick={() => removeRecent(s)}
                  className="p-1 rounded-full hover:bg-muted"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2" role="tablist">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor:
                activeTab === tab.id ? "var(--app-accent)" : "var(--app-card)",
              color: activeTab === tab.id ? "#fff" : "var(--app-text-muted)",
            }}
            data-ocid={"search.tab"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trending Tags row (Top or Tags tab) */}
      {(activeTab === "top" || activeTab === "tags") && !query && (
        <div>
          <h2
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--app-text)" }}
          >
            Trending
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TRENDING_TAGS.map((t) => (
              <button
                type="button"
                key={t.tag}
                onClick={() => {
                  setQuery(t.tag);
                  saveSearch(t.tag);
                }}
                className="flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl text-left transition-colors"
                style={{ backgroundColor: "var(--app-card)" }}
                data-ocid="search.tab"
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--app-text)" }}
                >
                  {t.tag}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {t.posts} posts
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags search result */}
      {query.startsWith("#") && (
        <div className="flex flex-col gap-2">
          {filteredTags.map((t) => (
            <div
              key={t.tag}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--app-card)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--app-accent)" }}
                >
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--app-text)" }}
                  >
                    {t.tag}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    {t.posts} posts
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* People search result or People tab */}
      {(!query.startsWith("#") && query && activeTab !== "tags") ||
      activeTab === "people" ? (
        <div className="flex flex-col gap-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--app-text)" }}
          >
            {activeTab === "people" && !query ? "Suggested for You" : "People"}
          </h2>
          {(activeTab === "people" && !query ? USERS : filteredUsers).map(
            (user, i) => (
              <div
                key={user.id}
                className="flex items-center justify-between"
                data-ocid={`search.item.${i + 1}`}
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const userStory = stories.find(
                      (s) => s.user.id === user.id,
                    );
                    return userStory ? (
                      <button
                        type="button"
                        onClick={() => setViewingStory(userStory)}
                        className="p-0 bg-transparent border-0 cursor-pointer flex-shrink-0"
                      >
                        <div
                          style={{
                            background:
                              "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                            padding: 2,
                            borderRadius: "50%",
                          }}
                        >
                          <div className="bg-background rounded-full p-[2px]">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                        </div>
                      </button>
                    ) : (
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                    );
                  })()}
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => onOpenUserProfile?.(user)}
                    data-ocid={`search.item.${i + 1}.link`}
                  >
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--app-text)" }}
                      >
                        {user.name}
                      </p>
                      {stories.find((s) => s.user.id === user.id) && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                          style={{
                            background:
                              "linear-gradient(45deg, #f09433, #bc1888)",
                          }}
                        >
                          Story
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      @{user.username} · {formatCount(user.followers)} followers
                    </p>
                  </button>
                </div>
                <Button
                  size="sm"
                  className="h-8 px-4 text-xs rounded-full text-white"
                  style={{
                    backgroundColor: followedUsers.has(user.id)
                      ? "var(--app-card)"
                      : "var(--app-accent)",
                    color: followedUsers.has(user.id)
                      ? "var(--app-text)"
                      : "#fff",
                  }}
                  onClick={() =>
                    setFollowedUsers((prev) => {
                      const next = new Set(prev);
                      if (next.has(user.id)) next.delete(user.id);
                      else next.add(user.id);
                      return next;
                    })
                  }
                  data-ocid={`search.item.${i + 1}.button`}
                >
                  {followedUsers.has(user.id) ? "Following" : "Follow"}
                </Button>
              </div>
            ),
          )}
        </div>
      ) : null}

      {/* Tags tab list */}
      {activeTab === "tags" && !query && (
        <div className="flex flex-col gap-2">
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--app-text)" }}
          >
            All Tags
          </h2>
          {TRENDING_TAGS.map((t, i) => (
            <div
              key={t.tag}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--app-card)" }}
              data-ocid={`search.item.${i + 1}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--app-accent)" }}
                >
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--app-text)" }}
                  >
                    {t.tag}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    {t.posts} posts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuery(t.tag);
                  saveSearch(t.tag);
                }}
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: "var(--app-accent)", color: "#fff" }}
                data-ocid="search.tab"
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Explore grid (Top tab, no query) */}
      {activeTab === "top" && !query && (
        <div>
          <h2
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--app-text)" }}
          >
            Explore
          </h2>
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor:
                    selectedCategory === cat
                      ? "var(--app-accent)"
                      : "var(--app-card)",
                  color:
                    selectedCategory === cat ? "#fff" : "var(--app-text-muted)",
                  border: "1px solid var(--app-border)",
                }}
                data-ocid="search.tab"
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Masonry 2-column grid */}
          <div className="grid grid-cols-2 gap-1.5" data-ocid="search.list">
            {masonryImages.map((img, i) => (
              <button
                type="button"
                key={img.id}
                className="relative overflow-hidden rounded-xl group"
                style={{ aspectRatio: img.tall ? "3 / 4" : "1 / 1" }}
                onClick={() =>
                  setLightboxImg({
                    image: img.image,
                    likes: img.likes,
                    username: img.username,
                    caption: img.caption,
                    commentCount: img.commentCount,
                    isLiked: false,
                  })
                }
                data-ocid={`search.item.${i + 1}`}
              >
                <img
                  src={img.tall ? img.image : img.squareImage}
                  alt="explore"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-1 text-white text-sm font-semibold">
                    <Heart className="w-4 h-4 fill-white" />
                    {formatCount(img.likes)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Post Preview Modal */}
      {lightboxImg && (
        <button
          type="button"
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 w-full"
          style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightboxImg(null)}
          data-ocid="search.modal"
        >
          <div
            className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto rounded-2xl flex flex-col"
            style={{ backgroundColor: "var(--app-card)" }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Top bar */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "var(--app-border)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {lightboxImg.username[0].toUpperCase()}
                  </span>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--app-text)" }}
                >
                  @{lightboxImg.username}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxImg((prev) =>
                      prev ? { ...prev, isFollowing: !prev.isFollowing } : null,
                    )
                  }
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: lightboxImg?.isFollowing
                      ? "var(--app-border)"
                      : "var(--app-accent)",
                    color: lightboxImg?.isFollowing
                      ? "var(--app-text-muted)"
                      : "#fff",
                  }}
                  data-ocid="search.button"
                >
                  {lightboxImg?.isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxImg(null)}
                  className="p-1.5 rounded-full"
                  style={{ color: "var(--app-text-muted)" }}
                  data-ocid="search.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image */}
            <img
              src={lightboxImg.image}
              alt="post"
              className="w-full object-contain"
              style={{ maxHeight: "65vh" }}
            />

            {/* Action bar */}
            <div className="px-4 pt-3 pb-1 flex items-center gap-4">
              <button
                type="button"
                onClick={() =>
                  setLightboxImg((prev) =>
                    prev
                      ? {
                          ...prev,
                          isLiked: !prev.isLiked,
                          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
                        }
                      : null,
                  )
                }
                className="flex items-center gap-1.5 transition-transform active:scale-90"
                data-ocid="search.toggle"
              >
                <Heart
                  className="w-6 h-6"
                  style={{
                    fill: lightboxImg.isLiked ? "#ef4444" : "transparent",
                    color: lightboxImg.isLiked ? "#ef4444" : "var(--app-text)",
                    strokeWidth: 2,
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--app-text)" }}
                >
                  {formatCount(lightboxImg.likes)}
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5"
                data-ocid="search.button"
              >
                <MessageCircle
                  className="w-6 h-6"
                  style={{ color: "var(--app-text)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--app-text)" }}
                >
                  {lightboxImg.commentCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setLightboxImg((prev) =>
                    prev ? { ...prev, isSaved: !prev.isSaved } : null,
                  )
                }
                className="flex items-center gap-1.5 transition-transform active:scale-90"
                data-ocid="search.toggle"
              >
                <Bookmark
                  className="w-6 h-6"
                  style={{
                    color: lightboxImg?.isSaved
                      ? "var(--app-accent)"
                      : "var(--app-text)",
                    fill: lightboxImg?.isSaved ? "var(--app-accent)" : "none",
                  }}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = lightboxImg?.image || "";
                  a.download = "connectly-post.jpg";
                  a.target = "_blank";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  toast.success("Downloaded! ⬇️");
                }}
                className="flex items-center gap-1.5 transition-transform active:scale-90"
                data-ocid="search.button"
              >
                <Download
                  className="w-6 h-6"
                  style={{ color: "var(--app-text)" }}
                />
              </button>
              <button
                type="button"
                onClick={() => setShowLightboxShare(true)}
                className="flex items-center gap-1.5"
                data-ocid="search.button"
              >
                <Send
                  className="w-6 h-6"
                  style={{ color: "var(--app-text)" }}
                />
              </button>
            </div>

            {/* Caption */}
            <div className="px-4 pb-2">
              <p className="text-sm" style={{ color: "var(--app-text)" }}>
                <span className="font-semibold">@{lightboxImg.username}</span>{" "}
                {lightboxImg.caption}
              </p>
            </div>

            {/* Mock comments */}
            <div className="px-4 pb-2 flex flex-col gap-1.5">
              {(
                masonryImages.find((m) => m.image === lightboxImg.image)
                  ?.mockComments ?? []
              ).map((c, ci) => (
                <p
                  key={`comment-${ci}-${c.u}`}
                  className="text-sm"
                  style={{ color: "var(--app-text)" }}
                >
                  <span className="font-semibold">@{c.u}</span>{" "}
                  <span style={{ color: "var(--app-text-muted)" }}>{c.t}</span>
                </p>
              ))}
            </div>

            {/* Comment input */}
            <div
              className="px-4 pb-4 pt-1 flex items-center gap-2 border-t"
              style={{ borderColor: "var(--app-border)" }}
            >
              <input
                type="text"
                placeholder="Add a comment..."
                value={lightboxComment}
                onChange={(e) => setLightboxComment(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: "var(--app-text)" }}
                data-ocid="search.input"
              />
              {lightboxComment.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Comment posted!");
                    setLightboxComment("");
                  }}
                  className="text-xs font-semibold"
                  style={{ color: "var(--app-accent)" }}
                  data-ocid="search.submit_button"
                >
                  Post
                </button>
              )}
            </div>
          </div>
        </button>
      )}
      <GlobalShareSheet
        open={showLightboxShare}
        onClose={() => setShowLightboxShare(false)}
        title={
          lightboxImg
            ? `Check out @${lightboxImg.username}'s post`
            : "Check this out!"
        }
        url={window.location.href}
      />
    </div>
  );
}

// ─── REELS PAGE ───────────────────────────────────────────────────────────────

function ReelsPage({
  userReels,
  followedUsers,
  setFollowedUsers,
  onOpenUserProfile,
}: {
  userReels?: Post[];
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
  onOpenUserProfile?: (user: AppUser) => void;
}) {
  const [reels, setReels] = useState<Reel[]>(() => {
    const extra: Reel[] = (userReels ?? []).map((p) => ({
      id: p.id,
      user: p.user,
      image: p.image,
      caption: p.caption,
      likes: p.likes,
      comments: p.comments,
      isLiked: p.isLiked ?? false,
      videoUrl: p.videoUrl,
    }));
    return [...extra, ...REELS];
  });
  const [soundOn, setSoundOn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentReelId, setCommentReelId] = useState<number | null>(null);
  type ReelComment = {
    id: number;
    user: string;
    text: string;
    replies: { id: number; user: string; text: string }[];
  };
  const [reelComments, setReelComments] = useState<
    Record<number, ReelComment[]>
  >({
    1: [
      { id: 1, user: "priya_s", text: "Love the energy! 🔥", replies: [] },
      {
        id: 2,
        user: "arjun_v",
        text: "This is so inspiring!",
        replies: [{ id: 3, user: "mehak_k", text: "Totally agree! 💯" }],
      },
      { id: 4, user: "rahul_d", text: "Goals 💪", replies: [] },
    ],
    2: [
      { id: 5, user: "sneha_r", text: "Paradise found 🌴", replies: [] },
      {
        id: 6,
        user: "karan_m",
        text: "I need to go here!",
        replies: [
          { id: 7, user: "priya_s", text: "Same! Let's plan a trip 🌊" },
        ],
      },
      { id: 8, user: "ananya_b", text: "So beautiful 😍", replies: [] },
    ],
    3: [
      { id: 9, user: "vikram_s", text: "Stunning view! ⛰️", replies: [] },
      { id: 10, user: "nisha_p", text: "Nature at its best", replies: [] },
      { id: 11, user: "rohit_k", text: "Breathtaking 🌅", replies: [] },
    ],
    4: [
      {
        id: 12,
        user: "divya_m",
        text: "Amazing skills!",
        replies: [{ id: 13, user: "arjun_v", text: "Tutorial please!! 🙏" }],
      },
      { id: 14, user: "aditya_r", text: "🙌🙌🙌", replies: [] },
    ],
    5: [
      { id: 15, user: "pooja_s", text: "Made this at home!", replies: [] },
      {
        id: 16,
        user: "nikhil_g",
        text: "Recipe please 🍕",
        replies: [{ id: 17, user: "pooja_s", text: "Will post it soon!" }],
      },
      { id: 18, user: "kavya_n", text: "Looks delicious!", replies: [] },
    ],
  });
  const [reelReplyTo, setReelReplyTo] = useState<{
    reelId: number;
    commentId: number;
    username: string;
  } | null>(null);
  const reelCommentNextId = useRef(100);
  const [commentInput, setCommentInput] = useState("");
  const [savedReels, setSavedReels] = useState<Set<number>>(
    () =>
      new Set(
        JSON.parse(localStorage.getItem("connectly_saved_reels") || "[]"),
      ),
  );
  const [doubleTapId, setDoubleTapId] = useState<number | null>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef<Record<number, number>>({});
  const snapContainerRef = useRef<HTMLDivElement>(null);
  const [pausedReels, setPausedReels] = useState<Set<number>>(new Set());
  const [showShareSheet, setShowShareSheet] = useState<number | null>(null);
  const [showMoreSheet, setShowMoreSheet] = useState<number | null>(null);
  const [showAudioSheet, setShowAudioSheet] = useState<number | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [showWhyDialog, setShowWhyDialog] = useState(false);
  const [showPrefsDialog, setShowPrefsDialog] = useState(false);
  const [showRemixConfirm, setShowRemixConfirm] = useState<number | null>(null);
  const [hiddenReelIds, setHiddenReelIds] = useState<Set<number>>(new Set());
  const [shareSearchQuery, setShareSearchQuery] = useState("");
  const [friendsSent, setFriendsSent] = useState<Set<number>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEcho, setAudioEcho] = useState(false);
  const [audioReverb, setAudioReverb] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState("1x");
  const [savedAudios, setSavedAudios] = useState<Set<number>>(new Set());
  const [showAudioShareSheet, setShowAudioShareSheet] = useState(false);
  const [showAudioQRModal, setShowAudioQRModal] = useState(false);
  const [reelProfileUser, setReelProfileUser] = useState<AppUser | null>(null);
  const [contentPrefs, setContentPrefs] = useState({
    Fitness: true,
    Food: true,
    Travel: true,
    Music: true,
    Fashion: true,
    Gaming: true,
    Comedy: true,
  });

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-reel-index"));
            setActiveIndex(idx);
          }
        }
      },
      { threshold: 0.7 },
    );
    for (const el of reelRefs.current) {
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []); // eslint-disable-line

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v) {
        if (i === activeIndex) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    });
  }, [activeIndex]);

  function handleLike(id: number) {
    setReels((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              isLiked: !r.isLiked,
              likes: r.isLiked ? r.likes - 1 : r.likes + 1,
            }
          : r,
      ),
    );
  }

  function handleShare(reelId: number) {
    setShowShareSheet(reelId);
  }

  function handleBookmark(id: number) {
    setSavedReels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Removed from saved");
      } else {
        next.add(id);
        toast.success("Saved to collection! 🔖");
      }
      localStorage.setItem(
        "connectly_saved_reels",
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  }

  function handleTap(reelId: number) {
    const now = Date.now();
    const last = lastTapRef.current[reelId] ?? 0;
    if (now - last < 300) {
      // double tap = like
      handleLike(reelId);
      setDoubleTapId(reelId);
      setTimeout(() => setDoubleTapId(null), 600);
    } else {
      // single tap = pause/play (with delay to wait for potential double tap)
      setTimeout(() => {
        const timeSinceLast = Date.now() - (lastTapRef.current[reelId] ?? 0);
        if (timeSinceLast >= 300) {
          setPausedReels((prev) => {
            const next = new Set(prev);
            const vidIdx = reels.findIndex((r) => r.id === reelId);
            const vid = videoRefs.current[vidIdx];
            if (next.has(reelId)) {
              next.delete(reelId);
              vid?.play().catch(() => {});
            } else {
              next.add(reelId);
              vid?.pause();
            }
            return next;
          });
        }
      }, 320);
    }
    lastTapRef.current[reelId] = now;
  }

  function handleSendComment() {
    if (!commentInput.trim() || commentReelId === null) return;
    const text = commentInput.trim();
    const newId = reelCommentNextId.current++;
    if (reelReplyTo && reelReplyTo.reelId === commentReelId) {
      setReelComments((prev) => ({
        ...prev,
        [commentReelId]: (prev[commentReelId] ?? []).map((c) =>
          c.id === reelReplyTo.commentId
            ? {
                ...c,
                replies: [...c.replies, { id: newId, user: "you", text }],
              }
            : c,
        ),
      }));
      setReelReplyTo(null);
    } else {
      setReelComments((prev) => ({
        ...prev,
        [commentReelId]: [
          ...(prev[commentReelId] ?? []),
          { id: newId, user: "you", text, replies: [] },
        ],
      }));
    }
    setCommentInput("");
    setReels((prev) =>
      prev.map((r) =>
        r.id === commentReelId ? { ...r, comments: r.comments + 1 } : r,
      ),
    );
  }

  return (
    <>
      {/* Progress dots */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 md:hidden pointer-events-none">
        {reels.slice(0, 6).map((reel, di) => (
          <div
            key={reel.id}
            style={{
              width: 3,
              height: activeIndex === di ? 18 : 6,
              borderRadius: 3,
              backgroundColor:
                activeIndex === di ? "white" : "rgba(255,255,255,0.4)",
              transition: "height 0.2s, background-color 0.2s",
            }}
          />
        ))}
      </div>
      {/* Trending Section */}
      <div className="bg-black/90 px-4 py-3 border-b border-white/10">
        <div className="mb-3">
          <p className="text-white text-xs font-semibold mb-2">
            🔥 Trending Now
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {reels.slice(0, 5).map((r, idx) => (
              <button
                key={r.id}
                type="button"
                onClick={() =>
                  reelRefs.current[idx]?.scrollIntoView({ behavior: "smooth" })
                }
                className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden relative"
              >
                <img
                  src={r.image}
                  alt="trending"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white text-xs font-semibold mb-2">
            🎵 Trending Songs
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {[
              "Shape of You",
              "Blinding Lights",
              "Levitating",
              "Stay",
              "As It Was",
            ].map((song, si) => (
              <button
                key={song}
                type="button"
                onClick={() => toast.success(`${song} selected! 🎵`)}
                className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 border border-white/20"
              >
                <span className="text-white text-xs">🎵</span>
                <div className="text-left">
                  <p className="text-white text-xs font-medium whitespace-nowrap">
                    {song}
                  </p>
                  <p className="text-white/60 text-[10px]">
                    {(1.2 + si * 0.4).toFixed(1)}K Reels
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="reels-fullscreen-container" data-ocid="reels.page">
        {/* Desktop nav arrows */}
        <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2 z-50">
          <button
            type="button"
            onClick={() => {
              const prev = activeIndex - 1;
              if (prev >= 0)
                reelRefs.current[prev]?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={activeIndex === 0}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition disabled:opacity-30 disabled:cursor-not-allowed"
            data-ocid="reels.pagination_prev"
            aria-label="Previous reel"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => {
              const next = activeIndex + 1;
              if (next < reels.length)
                reelRefs.current[next]?.scrollIntoView({ behavior: "smooth" });
            }}
            disabled={activeIndex === reels.length - 1}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition disabled:opacity-30 disabled:cursor-not-allowed"
            data-ocid="reels.pagination_next"
            aria-label="Next reel"
          >
            ↓
          </button>
        </div>
        <div className="snap-container" ref={snapContainerRef}>
          {reels
            .filter((r) => !hiddenReelIds.has(r.id))
            .map((reel, i) => (
              <div
                key={reel.id}
                ref={(el) => {
                  reelRefs.current[i] = el;
                }}
                data-reel-index={i}
                className="snap-item relative w-full flex-shrink-0"
                style={{ height: "100%" }}
                onClick={() => handleTap(reel.id)}
                onKeyDown={(e) => e.key === "Enter" && handleTap(reel.id)}
                data-ocid={`reels.item.${i + 1}`}
              >
                {reel.videoUrl ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={reel.videoUrl}
                    muted={!soundOn}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={reel.image}
                    alt="reel"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)",
                  }}
                />
                {/* Pause/Play indicator */}
                {pausedReels.has(reel.id) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="bg-black/40 rounded-full p-4">
                      <Play className="w-10 h-10 text-white fill-white" />
                    </div>
                  </div>
                )}
                {/* Double-tap heart animation */}
                {doubleTapId === reel.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <span className="text-6xl animate-ping">❤️</span>
                  </div>
                )}
                {/* Bottom info */}
                <div
                  className="absolute bottom-6 left-4 right-16 pointer-events-none"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {/* Friends watching */}
                  {activeIndex === i && (
                    <div className="flex items-center gap-1 mb-2 pointer-events-none">
                      <div className="flex -space-x-1">
                        {["P", "A", "M"].map((l) => (
                          <div
                            key={l}
                            className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 border border-white flex items-center justify-center text-white text-[8px] font-bold"
                          >
                            {l}
                          </div>
                        ))}
                      </div>
                      <span className="text-white text-[11px] ml-1">
                        priya_s, arjun_v +3 watching
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      className="pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenUserProfile) {
                          onOpenUserProfile(reel.user);
                        } else {
                          setReelProfileUser(reel.user);
                        }
                      }}
                    >
                      <Avatar className="w-9 h-9 border-2 border-white">
                        <AvatarImage
                          src={reel.user.avatar}
                          alt={reel.user.name}
                        />
                        <AvatarFallback>{reel.user.name[0]}</AvatarFallback>
                      </Avatar>
                    </button>
                    <button
                      type="button"
                      className="pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenUserProfile) {
                          onOpenUserProfile(reel.user);
                        } else {
                          setReelProfileUser(reel.user);
                        }
                      }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {reel.user.username}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFollowedUsers((prev) => {
                          const next = new Set(prev);
                          if (next.has(reel.user.id)) {
                            next.delete(reel.user.id);
                          } else {
                            next.add(reel.user.id);
                          }
                          return next;
                        });
                      }}
                      className={`text-xs px-3 py-0.5 rounded-full pointer-events-auto transition-all ${
                        followedUsers.has(reel.user.id)
                          ? "bg-white/20 border border-white/50 text-white/80"
                          : "border border-white text-white"
                      }`}
                      data-ocid={`reels.item.${i + 1}.button`}
                    >
                      {followedUsers.has(reel.user.id) ? "Following" : "Follow"}
                    </button>
                  </div>
                  <p className="text-white text-sm">{reel.caption}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAudioSheet(reel.id);
                    }}
                    className="flex items-center gap-1 mt-2 text-white/80 text-xs pointer-events-auto cursor-pointer hover:text-white transition-colors"
                  >
                    <Music
                      className="w-3 h-3 animate-spin"
                      style={{ animationDuration: "3s" }}
                    />
                    <span>Original Audio • {reel.user.name}</span>
                  </button>
                </div>
                {/* Swipe up hint — first reel only */}
                {i === 0 && (
                  <div className="reel-swipe-hint absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none z-10">
                    <span
                      className="text-white/80 text-xs"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      ↑ Swipe up
                    </span>
                  </div>
                )}
                {/* More options — top left */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreSheet(reel.id);
                  }}
                  className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                  data-ocid={`reels.item.${i + 1}.secondary_button`}
                  aria-label="More options"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
                {/* Fullscreen — top right -2nd */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFullscreen) {
                      document.documentElement
                        .requestFullscreen?.()
                        .catch(() => {});
                    } else {
                      document.exitFullscreen?.().catch(() => {});
                    }
                  }}
                  className="absolute top-4 right-16 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                  data-ocid={`reels.item.${i + 1}.toggle`}
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5 text-white" />
                  ) : (
                    <Maximize className="w-5 h-5 text-white" />
                  )}
                </button>
                {/* Sound toggle — top right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSoundOn((s) => !s);
                  }}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/40 backdrop-blur-sm"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                  data-ocid={`reels.item.${i + 1}.toggle`}
                >
                  {soundOn ? (
                    <Volume2 className="w-5 h-5 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-white" />
                  )}
                </button>
                {/* Right actions */}
                <div className="absolute right-4 bottom-6 flex flex-col items-center gap-6">
                  {/* Like */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(reel.id);
                    }}
                    className="flex flex-col items-center gap-1"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                    data-ocid={`reels.item.${i + 1}.toggle`}
                  >
                    <Heart
                      className="w-7 h-7"
                      style={{
                        color: reel.isLiked ? "#E53935" : "white",
                        fill: reel.isLiked ? "#E53935" : "none",
                      }}
                    />
                    <span
                      className="text-white text-xs"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      {formatCount(reel.likes)}
                    </span>
                  </button>
                  {/* Comment */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCommentReelId(reel.id);
                    }}
                    className="flex flex-col items-center gap-1"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                    data-ocid={`reels.item.${i + 1}.open_modal_button`}
                  >
                    <MessageCircle className="w-7 h-7 text-white" />
                    <span
                      className="text-white text-xs"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      {formatCount(reel.comments)}
                    </span>
                  </button>
                  {/* Share */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(reel.id);
                    }}
                    className="flex flex-col items-center gap-1"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                    data-ocid={`reels.item.${i + 1}.secondary_button`}
                  >
                    <Send className="w-7 h-7 text-white" />
                    <span
                      className="text-white text-xs"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      Share
                    </span>
                  </button>

                  {/* Save/Bookmark */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(reel.id);
                    }}
                    className="flex flex-col items-center gap-1"
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                    data-ocid={`reels.item.${i + 1}.bookmark_button`}
                  >
                    <Bookmark
                      className="w-7 h-7"
                      style={{
                        color: savedReels.has(reel.id) ? "#FACC15" : "white",
                        fill: savedReels.has(reel.id) ? "#FACC15" : "none",
                      }}
                    />
                    <span
                      className="text-white text-xs"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                    >
                      {savedReels.has(reel.id) ? "Saved" : "Save"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Share Sheet */}
      {showShareSheet !== null && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowShareSheet(null)}
            onKeyDown={(e) => e.key === "Escape" && setShowShareSheet(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
            data-ocid="reels.sheet"
          >
            <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <h3 className="font-semibold text-base dark:text-white mb-3">
              Share Reel
            </h3>
            <input
              value={shareSearchQuery}
              onChange={(e) => setShareSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full rounded-full bg-zinc-100 dark:bg-zinc-800 dark:text-white px-4 py-2 text-sm mb-4 outline-none"
              data-ocid="reels.search_input"
            />
            <p className="text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wide">
              Quick Actions
            </p>
            <div
              className="flex gap-3 overflow-x-auto pb-2 mb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {[
                {
                  icon: "🔁",
                  label: "Remix",
                  action: () => {
                    setShowRemixConfirm(showShareSheet);
                    setShowShareSheet(null);
                  },
                },
                {
                  icon: "📖",
                  label: "Add to Story",
                  action: () => {
                    toast.success("Added to your story! ✨");
                    setShowShareSheet(null);
                  },
                },
                {
                  icon: "💬",
                  label: "WhatsApp",
                  action: () => {
                    toast.success("Opening WhatsApp... 💬");
                    setShowShareSheet(null);
                  },
                },
                {
                  icon: "📱",
                  label: "WA Status",
                  action: () => {
                    toast.success("Added to WhatsApp Status! 📱");
                    setShowShareSheet(null);
                  },
                },
                {
                  icon: "💌",
                  label: "SMS",
                  action: () => {
                    toast.success("Opening SMS... 💌");
                    setShowShareSheet(null);
                  },
                },
                {
                  icon: "🔗",
                  label: "Copy Link",
                  action: () => {
                    navigator.clipboard
                      ?.writeText(
                        `https://connectly.app/reel/${showShareSheet}`,
                      )
                      .catch(() => {});
                    toast.success("Link copied! 🔗");
                    setShowShareSheet(null);
                  },
                },
                {
                  icon: "⬇️",
                  label: "Download",
                  action: () => {
                    toast.success("Downloading reel... ⬇️");
                    setShowShareSheet(null);
                  },
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  data-ocid="reels.button"
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <span className="text-xs dark:text-white whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wide">
              Share to other apps
            </p>
            <div
              className="flex gap-3 overflow-x-auto pb-2 mb-4"
              style={{ scrollbarWidth: "none" }}
            >
              {[
                {
                  icon: "📸",
                  label: "Instagram",
                  action: () => toast.success("Opening Instagram..."),
                },
                {
                  icon: "🐦",
                  label: "Twitter/X",
                  action: () => toast.success("Opening Twitter/X..."),
                },
                {
                  icon: "✈️",
                  label: "Telegram",
                  action: () => toast.success("Opening Telegram..."),
                },
                {
                  icon: "📧",
                  label: "Email",
                  action: () => toast.success("Opening Email..."),
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setShowShareSheet(null);
                  }}
                  className="flex flex-col items-center gap-1 flex-shrink-0"
                  data-ocid="reels.button"
                >
                  <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <span className="text-xs dark:text-white whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wide">
              Send to friends
            </p>
            <div className="space-y-2">
              {USERS.filter((u) =>
                u.name.toLowerCase().includes(shareSearchQuery.toLowerCase()),
              )
                .slice(0, 5)
                .map((u) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">
                        {u.name}
                      </p>
                      <p className="text-xs text-zinc-400">@{u.username}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFriendsSent((prev) => new Set([...prev, u.id]));
                        toast.success(`Sent to ${u.name}! 🚀`);
                      }}
                      className={`text-xs px-4 py-1.5 rounded-full font-medium ${friendsSent.has(u.id) ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400" : "btn-gradient text-white"}`}
                      data-ocid="reels.button"
                    >
                      {friendsSent.has(u.id) ? "Sent ✓" : "Send"}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Remix Confirm Modal */}
      {showRemixConfirm !== null && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowRemixConfirm(null)}
            onKeyDown={(e) => e.key === "Escape" && setShowRemixConfirm(null)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80"
            data-ocid="reels.dialog"
          >
            <h3 className="font-semibold text-base dark:text-white mb-2">
              Create Remix?
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              This will add a remixed version to your reels.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowRemixConfirm(null)}
                className="flex-1 py-2 rounded-full border border-zinc-300 dark:border-zinc-700 text-sm dark:text-white"
                data-ocid="reels.cancel_button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const orig = reels.find((r) => r.id === showRemixConfirm);
                  if (orig) {
                    const remixed: Reel = {
                      ...orig,
                      id: Date.now(),
                      caption: `🔁 Remix: ${orig.caption}`,
                      likes: 0,
                      comments: 0,
                      isLiked: false,
                    };
                    setReels((prev) => [remixed, ...prev]);
                    toast.success("Remix created! 🔁");
                  }
                  setShowRemixConfirm(null);
                }}
                className="flex-1 py-2 rounded-full btn-gradient text-white text-sm font-medium"
                data-ocid="reels.confirm_button"
              >
                Remix
              </button>
            </div>
          </div>
        </>
      )}

      {/* More Options Sheet */}
      {showMoreSheet !== null && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowMoreSheet(null)}
            onKeyDown={(e) => e.key === "Escape" && setShowMoreSheet(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl p-4"
            data-ocid="reels.sheet"
          >
            <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <div className="space-y-1">
              {[
                {
                  icon: "🤖",
                  label: "AI Information",
                  action: () => {
                    setShowAIDialog(true);
                    setShowMoreSheet(null);
                  },
                },
                {
                  icon: "❓",
                  label: "Why you're seeing this",
                  action: () => {
                    setShowWhyDialog(true);
                    setShowMoreSheet(null);
                  },
                },
                {
                  icon: "👍",
                  label: "Interested",
                  action: () => {
                    toast.success("Got it! We'll show you more like this 👍");
                    setShowMoreSheet(null);
                  },
                },
                {
                  icon: "👎",
                  label: "Not Interested",
                  action: () => {
                    setHiddenReelIds(
                      (prev) => new Set([...prev, showMoreSheet!]),
                    );
                    toast.success("We'll show you less like this");
                    setShowMoreSheet(null);
                  },
                },
                {
                  icon: "🚩",
                  label: "Report",
                  action: () => {
                    toast.success(
                      "Report submitted. We'll review this content.",
                    );
                    setShowMoreSheet(null);
                  },
                },
                {
                  icon: "⚙️",
                  label: "Manage Content Preferences",
                  action: () => {
                    setShowPrefsDialog(true);
                    setShowMoreSheet(null);
                  },
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 text-left"
                  data-ocid="reels.button"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium dark:text-white">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Audio Share Sheet */}
      <GlobalShareSheet
        open={showAudioShareSheet}
        onClose={() => setShowAudioShareSheet(false)}
        title="Check out this audio on Connectly!"
        url={`https://connectly.app/audio/reel-${showAudioSheet}`}
      />

      {/* Audio QR Modal */}
      {showAudioQRModal && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={() => setShowAudioQRModal(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowAudioQRModal(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] bg-white dark:bg-zinc-900 rounded-2xl p-6 w-72 flex flex-col items-center gap-4"
            data-ocid="reels.dialog"
          >
            <h3 className="font-bold dark:text-white">Audio QR Code</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(15,1fr)",
                width: 150,
                height: 150,
                gap: 2,
                background: "white",
                padding: 8,
                borderRadius: 8,
              }}
            >
              {Array.from({ length: 225 }, (_, qIdx) => {
                const r = Math.floor(qIdx / 15);
                const c = qIdx % 15;
                const isCorner =
                  (r < 3 && c < 3) || (r < 3 && c > 11) || (r > 11 && c < 3);
                const filled =
                  isCorner || (r * 3 + c * 7 + (showAudioSheet || 1)) % 3 !== 0;
                return (
                  <div
                    key={`aqr-r${r}-c${c}`}
                    style={{
                      background: filled ? "#000" : "transparent",
                      borderRadius: isCorner ? 2 : 0,
                    }}
                  />
                );
              })}
            </div>
            <p className="text-xs text-center text-zinc-500">
              Scan to open this audio
            </p>
            <button
              type="button"
              onClick={() => setShowAudioQRModal(false)}
              className="w-full py-2 rounded-full btn-gradient text-white text-sm font-medium"
              data-ocid="reels.confirm_button"
            >
              Done
            </button>
          </div>
        </>
      )}

      {/* AI Info Dialog */}
      {showAIDialog && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowAIDialog(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowAIDialog(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 max-w-[90vw]"
            data-ocid="reels.dialog"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🤖</span>
              <h3 className="font-semibold dark:text-white">AI Information</h3>
            </div>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <p>
                <span className="font-medium dark:text-white">
                  Content Category:
                </span>{" "}
                Outdoor Fitness & Lifestyle
              </p>
              <p>
                <span className="font-medium dark:text-white">Engagement:</span>{" "}
                High (Top 5% this week)
              </p>
              <p>
                <span className="font-medium dark:text-white">Keywords:</span>{" "}
                motivation, fitness, goals, lifestyle
              </p>
              <p>
                <span className="font-medium dark:text-white">
                  Recommended for:
                </span>{" "}
                Health, Sports, Lifestyle
              </p>
              <p>
                <span className="font-medium dark:text-white">
                  Creator Score:
                </span>{" "}
                ⭐ 4.8/5.0
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAIDialog(false)}
              className="mt-4 w-full py-2 rounded-full btn-gradient text-white text-sm font-medium"
              data-ocid="reels.confirm_button"
            >
              Got it
            </button>
          </div>
        </>
      )}

      {/* Why Seeing Dialog */}
      {showWhyDialog && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowWhyDialog(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowWhyDialog(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 max-w-[90vw]"
            data-ocid="reels.dialog"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">❓</span>
              <h3 className="font-semibold dark:text-white">
                Why you&apos;re seeing this
              </h3>
            </div>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <p>You&apos;re seeing this reel because:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>You&apos;ve watched similar fitness content</li>
                <li>You follow this creator</li>
                <li>This is trending in your area</li>
                <li>Your interests include Health &amp; Fitness</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowWhyDialog(false)}
              className="mt-4 w-full py-2 rounded-full btn-gradient text-white text-sm font-medium"
              data-ocid="reels.confirm_button"
            >
              Got it
            </button>
          </div>
        </>
      )}

      {/* Reel Profile Modal */}
      {reelProfileUser && (
        <UserProfileModal
          user={reelProfileUser}
          posts={[]}
          stories={[]}
          followedUsers={followedUsers}
          allUsers={USERS}
          onToggleFollow={(id) =>
            setFollowedUsers((prev) => {
              const n = new Set(prev);
              if (n.has(id)) n.delete(id);
              else n.add(id);
              return n;
            })
          }
          onClose={() => setReelProfileUser(null)}
          onOpenStory={() => {}}
        />
      )}

      {/* Manage Preferences Dialog */}
      {showPrefsDialog && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowPrefsDialog(false)}
            onKeyDown={(e) => e.key === "Escape" && setShowPrefsDialog(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 max-w-[90vw] max-h-[80vh] overflow-y-auto"
            data-ocid="reels.dialog"
          >
            <h3 className="font-semibold dark:text-white mb-4">
              ⚙️ Content Preferences
            </h3>
            <div className="space-y-3">
              {(
                Object.entries(contentPrefs) as [
                  keyof typeof contentPrefs,
                  boolean,
                ][]
              ).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm dark:text-white">{key}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setContentPrefs((prev) => ({
                        ...prev,
                        [key]: !prev[key],
                      }))
                    }
                    className={`w-12 h-6 rounded-full transition-colors relative ${val ? "btn-gradient" : "bg-zinc-300 dark:bg-zinc-600"}`}
                    data-ocid="reels.toggle"
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${val ? "translate-x-6" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowPrefsDialog(false);
                toast.success("Preferences saved! ✨");
              }}
              className="mt-4 w-full py-2 rounded-full btn-gradient text-white text-sm font-medium"
              data-ocid="reels.save_button"
            >
              Save
            </button>
          </div>
        </>
      )}

      {/* Audio Info Sheet */}
      {showAudioSheet !== null && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={() => setShowAudioSheet(null)}
            onKeyDown={(e) => e.key === "Escape" && setShowAudioSheet(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto"
            data-ocid="reels.sheet"
          >
            <div className="w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            {(() => {
              const audioReel = reels.find((r) => r.id === showAudioSheet);
              const audioId = `#AUD-${(((showAudioSheet || 1) * 7 + 1337) % 9000) + 1000}`;
              const reelCount =
                (((showAudioSheet || 1) * 317 + 200) % 4800) + 200;
              const audioDuration = `${Math.floor((((showAudioSheet || 1) * 13) % 2) + 0)}:${String((((showAudioSheet || 1) * 17 + 15) % 45) + 10)}`;
              return audioReel ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={audioReel.image}
                        alt="audio"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold dark:text-white text-base">
                          Original Audio
                        </p>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(90deg, #ff4500, #ff6b00)",
                          }}
                        >
                          🔥 Trending
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {audioReel.user.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-zinc-400">
                          🎵 Original Audio
                        </span>
                        <span className="text-xs text-zinc-400">
                          ID: {audioId}
                        </span>
                        <span className="text-xs text-zinc-400">
                          ⏱ {audioDuration}
                        </span>
                      </div>
                      <p className="text-xs text-violet-500 font-semibold mt-1">
                        {reelCount.toLocaleString()} Reels made with this audio
                      </p>
                    </div>
                  </div>
                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-around mb-4 border-y border-zinc-100 dark:border-zinc-800 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSavedAudios((prev) => {
                          const n = new Set(prev);
                          if (n.has(showAudioSheet!)) {
                            n.delete(showAudioSheet!);
                            toast.success("Audio removed from saved");
                          } else {
                            n.add(showAudioSheet!);
                            toast.success("Audio saved! 🎵");
                          }
                          return n;
                        });
                      }}
                      className="flex flex-col items-center gap-1"
                      data-ocid="reels.toggle"
                    >
                      <Heart
                        className="w-6 h-6"
                        style={{
                          fill: savedAudios.has(showAudioSheet!)
                            ? "#ef4444"
                            : "none",
                          color: savedAudios.has(showAudioSheet!)
                            ? "#ef4444"
                            : "inherit",
                        }}
                      />
                      <span className="text-xs dark:text-white">
                        {savedAudios.has(showAudioSheet!) ? "Saved" : "Save"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAudioShareSheet(true)}
                      className="flex flex-col items-center gap-1"
                      data-ocid="reels.button"
                    >
                      <Share2 className="w-6 h-6 dark:text-white" />
                      <span className="text-xs dark:text-white">Share</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Audio reported. Thank you! 🚩");
                        setShowAudioSheet(null);
                      }}
                      className="flex flex-col items-center gap-1"
                      data-ocid="reels.button"
                    >
                      <Flag className="w-6 h-6 dark:text-white" />
                      <span className="text-xs dark:text-white">Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(`https://connectly.app/audio/${audioId}`)
                          .catch(() => {});
                        toast.success("Audio link copied! 🔗");
                      }}
                      className="flex flex-col items-center gap-1"
                      data-ocid="reels.button"
                    >
                      <Copy className="w-6 h-6 dark:text-white" />
                      <span className="text-xs dark:text-white">Copy Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAudioQRModal(true)}
                      className="flex flex-col items-center gap-1"
                      data-ocid="reels.button"
                    >
                      <Hash className="w-6 h-6 dark:text-white" />
                      <span className="text-xs dark:text-white">QR Code</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Audio selected! 🎵");
                      setShowAudioSheet(null);
                    }}
                    className="w-full py-2 rounded-full btn-gradient text-white text-sm font-medium mb-4"
                    data-ocid="reels.button"
                  >
                    🎵 Use Audio
                  </button>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                    Sound Effects
                  </p>
                  <div className="flex gap-3 mb-3">
                    {(
                      [
                        { label: "Echo", val: audioEcho, set: setAudioEcho },
                        {
                          label: "Reverb",
                          val: audioReverb,
                          set: setAudioReverb,
                        },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() =>
                          (
                            item.set as React.Dispatch<
                              React.SetStateAction<boolean>
                            >
                          )(!item.val)
                        }
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${item.val ? "bg-violet-500 text-white border-violet-500" : "border-zinc-300 dark:border-zinc-700 dark:text-white"}`}
                        data-ocid="reels.toggle"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                    Speed
                  </p>
                  <div className="flex gap-2 mb-4">
                    {["0.5x", "1x", "1.5x", "2x"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setAudioSpeed(s)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${audioSpeed === s ? "bg-purple-600 text-white border-purple-600" : "border-zinc-300 dark:border-zinc-700 dark:text-white"}`}
                        data-ocid="reels.toggle"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                    Reels with this audio
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {reels.slice(0, 6).map((r) => (
                      <div
                        key={r.id}
                        className="aspect-[9/16] rounded-lg overflow-hidden relative"
                      >
                        <img
                          src={r.image}
                          alt="reel"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </>
      )}

      {/* Comments bottom sheet */}
      {commentReelId !== null && (
        <>
          <div
            role="button"
            tabIndex={0}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setCommentReelId(null)}
            onKeyDown={(e) => e.key === "Escape" && setCommentReelId(null)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-900 rounded-t-2xl p-4 flex flex-col reel-comment-sheet"
            style={{ maxHeight: "70vh" }}
            data-ocid="reels.modal"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base dark:text-white">
                Comments
              </h3>
              <button
                type="button"
                onClick={() => setCommentReelId(null)}
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                data-ocid="reels.close_button"
              >
                <X className="w-5 h-5 dark:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3 min-h-0">
              {(reelComments[commentReelId] ?? []).map((c) => (
                <div key={`comment-${c.id}`} className="space-y-2">
                  {/* Top-level comment */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      {c.user[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div>
                        <span className="text-xs font-semibold dark:text-white">
                          @{c.user}{" "}
                        </span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-300">
                          {c.text}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReelReplyTo({
                            reelId: commentReelId,
                            commentId: c.id,
                            username: c.user,
                          });
                          setCommentInput(`@${c.user} `);
                        }}
                        className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 hover:text-blue-500 transition-colors font-medium"
                        data-ocid="reels.secondary_button"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  {/* Nested replies */}
                  {c.replies.length > 0 && (
                    <div className="ml-10 space-y-2">
                      {c.replies.map((r) => (
                        <div
                          key={`reply-${r.id}`}
                          className="flex items-start gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                            {r.user[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div>
                              <span className="text-xs font-semibold dark:text-white">
                                @{r.user}{" "}
                              </span>
                              <span className="text-xs text-zinc-600 dark:text-zinc-300">
                                {r.text}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReelReplyTo({
                                  reelId: commentReelId,
                                  commentId: c.id,
                                  username: r.user,
                                });
                                setCommentInput(`@${r.user} `);
                              }}
                              className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 hover:text-blue-500 transition-colors font-medium"
                              data-ocid="reels.secondary_button"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(reelComments[commentReelId] ?? []).length === 0 && (
                <p
                  className="text-sm text-zinc-400 text-center py-6"
                  data-ocid="reels.empty_state"
                >
                  No comments yet. Be first! 💬
                </p>
              )}
            </div>
            {/* Reply-to indicator */}
            {reelReplyTo && reelReplyTo.reelId === commentReelId && (
              <div className="flex items-center justify-between px-2 py-1.5 mb-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <span className="text-xs text-blue-500 dark:text-blue-400">
                  Replying to{" "}
                  <span className="font-semibold">@{reelReplyTo.username}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReelReplyTo(null);
                    setCommentInput("");
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ml-2"
                  data-ocid="reels.close_button"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 border-t dark:border-zinc-700 pt-3">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder={
                  reelReplyTo
                    ? `Reply to @${reelReplyTo.username}...`
                    : "Add a comment..."
                }
                className="flex-1 text-sm bg-zinc-100 dark:bg-zinc-800 dark:text-white rounded-full px-4 py-2 outline-none"
                data-ocid="reels.input"
              />
              <button
                type="button"
                onClick={handleSendComment}
                className="text-sm font-semibold text-blue-500 px-2"
                data-ocid="reels.submit_button"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────

type NotifFilter =
  | "all"
  | "likes"
  | "comments"
  | "follows"
  | "mentions"
  | "stories";

function NotificationsPage({
  notifications,
  setNotifications,
  onNewNotif,
  followedUsers,
  setFollowedUsers,
  onOpenUserProfile,
}: {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onNewNotif?: (n: Notification) => void;
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
  onOpenUserProfile?: (user: AppUser) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<NotifFilter>("all");
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const nextIdRef = useRef(1000);

  // Real-time simulation: add a new notification every 8s
  useEffect(() => {
    const types: Notification["type"][] = [
      "like",
      "follow",
      "comment",
      "mention",
      "story_like",
      "story_comment",
    ];
    const texts: Record<Notification["type"], string> = {
      like: "liked your photo",
      follow: "started following you",
      comment: 'commented: "Love this! 😍"',
      mention: "mentioned you in a comment",
      story_like: "liked your story ❤️",
      story_comment: 'commented on your story: "So cool! 🔥"',
    };
    const interval = setInterval(() => {
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const newNotif: Notification = {
        id: nextIdRef.current++,
        user,
        type,
        text: texts[type],
        time: "just now",
        read: false,
      };
      setNewIds((prev) => new Set([...prev, newNotif.id]));
      setNotifications((prev) => [newNotif, ...prev]);
      if (onNewNotif) onNewNotif(newNotif);
      // Remove highlight after 3s
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(newNotif.id);
          return next;
        });
      }, 3000);
    }, 5000);
    return () => clearInterval(interval);
  }, [setNotifications, onNewNotif]);

  const filterTabs: { id: NotifFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "likes", label: "❤️ Likes" },
    { id: "comments", label: "💬 Comments" },
    { id: "follows", label: "👤 Follows" },
    { id: "mentions", label: "@ Mentions" },
    { id: "stories", label: "📖 Stories" },
  ];

  function matchesFilter(n: Notification): boolean {
    if (activeFilter === "all") return true;
    if (activeFilter === "likes") return n.type === "like";
    if (activeFilter === "comments") return n.type === "comment";
    if (activeFilter === "follows") return n.type === "follow";
    if (activeFilter === "mentions") return n.type === "mention";
    if (activeFilter === "stories")
      return n.type === "story_like" || n.type === "story_comment";
    return true;
  }

  const filtered = notifications.filter(matchesFilter);
  const unread = filtered.filter((n) => !n.read);
  const read = filtered.filter((n) => n.read);
  const hasUnread = notifications.some((n) => !n.read);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="flex flex-col gap-3 pb-4" data-ocid="notifications.page">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1
          className="text-base font-bold"
          style={{ color: "var(--app-text)" }}
        >
          Notifications
        </h1>
        {hasUnread && (
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              color: "var(--app-accent)",
              backgroundColor: "var(--app-card)",
            }}
            data-ocid="notifications.button"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              backgroundColor:
                activeFilter === tab.id
                  ? "var(--app-accent)"
                  : "var(--app-card)",
              color: activeFilter === tab.id ? "#fff" : "var(--app-text-muted)",
            }}
            data-ocid="notifications.tab"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* New section */}
      {unread.length > 0 && (
        <>
          <h2
            className="text-sm font-semibold px-1"
            style={{ color: "var(--app-text)" }}
          >
            New
          </h2>
          <div className="flex flex-col gap-1" data-ocid="notifications.list">
            {unread.map((n, i) => (
              <NotificationItem
                key={n.id}
                notification={n}
                index={i + 1}
                isNew={newIds.has(n.id)}
                followedUsers={followedUsers}
                setFollowedUsers={setFollowedUsers}
                onOpenUserProfile={onOpenUserProfile}
              />
            ))}
          </div>
        </>
      )}

      {/* Earlier section */}
      {read.length > 0 && (
        <>
          <h2
            className="text-sm font-semibold px-1 mt-1"
            style={{ color: "var(--app-text-muted)" }}
          >
            Earlier
          </h2>
          <div className="flex flex-col gap-1">
            {read.map((n, i) => (
              <NotificationItem
                key={n.id}
                notification={n}
                index={unread.length + i + 1}
                isNew={false}
                followedUsers={followedUsers}
                setFollowedUsers={setFollowedUsers}
                onOpenUserProfile={onOpenUserProfile}
              />
            ))}
          </div>
        </>
      )}

      {filtered.length === 0 && (
        <div
          className="text-center py-12"
          style={{ color: "var(--app-text-muted)" }}
          data-ocid="notifications.empty_state"
        >
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No notifications here</p>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  notification: n,
  index,
  isNew = false,
  followedUsers,
  setFollowedUsers,
  onOpenUserProfile,
}: {
  notification: Notification;
  index: number;
  isNew?: boolean;
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
  onOpenUserProfile?: (user: AppUser) => void;
}) {
  const iconColor =
    n.type === "like"
      ? "#E53935"
      : n.type === "follow"
        ? "#1E88FF"
        : n.type === "story_like" || n.type === "story_comment"
          ? "#9C27B0"
          : "#9AA3AD";

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-500"
      style={{
        backgroundColor: isNew
          ? "rgba(59,130,246,0.15)"
          : !n.read
            ? "rgba(30,136,255,0.08)"
            : "transparent",
        animation: isNew ? "slideInLeft 0.25s ease" : undefined,
      }}
      data-ocid={`notifications.item.${index}`}
    >
      <button
        type="button"
        className="relative flex-shrink-0 active:opacity-70 transition-opacity"
        onClick={() => onOpenUserProfile?.(n.user)}
        data-ocid={`notifications.item.${index}.link`}
      >
        <Avatar className="w-11 h-11">
          <AvatarImage src={n.user.avatar} alt={n.user.name} />
          <AvatarFallback>{n.user.name[0]}</AvatarFallback>
        </Avatar>
        <div
          className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-background"
          style={{ backgroundColor: "var(--app-card)" }}
        >
          {n.type === "like" && (
            <Heart
              className="w-3 h-3"
              style={{ color: iconColor, fill: iconColor }}
            />
          )}
          {n.type === "follow" && (
            <UserIcon className="w-3 h-3" style={{ color: iconColor }} />
          )}
          {n.type === "comment" && (
            <MessageCircle className="w-3 h-3" style={{ color: iconColor }} />
          )}
          {n.type === "mention" && (
            <span
              className="text-[10px] font-bold"
              style={{ color: iconColor }}
            >
              @
            </span>
          )}
          {n.type === "story_like" && (
            <BookOpen className="w-3 h-3" style={{ color: iconColor }} />
          )}
          {n.type === "story_comment" && (
            <MessageCircle className="w-3 h-3" style={{ color: iconColor }} />
          )}
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: "var(--app-text)" }}>
          <span className="font-semibold">{n.user.name}</span> {n.text}
        </p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--app-text-muted)" }}
        >
          {n.time}
        </p>
      </div>
      {n.postImage && (
        <img
          src={n.postImage}
          alt="post"
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      )}
      {
        <Button
          size="sm"
          onClick={() =>
            setFollowedUsers((prev) => {
              const next = new Set(prev);
              if (next.has(n.user.id)) next.delete(n.user.id);
              else next.add(n.user.id);
              return next;
            })
          }
          className="h-8 px-4 text-xs rounded-full flex-shrink-0"
          style={
            followedUsers.has(n.user.id)
              ? {
                  backgroundColor: "var(--app-card)",
                  color: "var(--app-text)",
                  border: "1px solid var(--app-border)",
                }
              : { backgroundColor: "var(--app-accent)", color: "#fff" }
          }
          data-ocid={`notifications.item.${index}.button`}
        >
          {followedUsers.has(n.user.id) ? "Following" : "Follow"}
        </Button>
      }
    </div>
  );
}

// ─── CHAT PAGE ────────────────────────────────────────────────────────────────

const ONLINE_USER_IDS = new Set([1, 3]); // mock online users
const AUTO_REPLIES = [
  "That's so cool! 😍",
  "Haha yes!!",
  "Tell me more 🙏",
  "Sounds amazing!",
  "LOL 😂",
  "I agree!",
  "Can't wait! 🎉",
  "No way! 😱",
  "Aww ❤️",
  "That's what I was thinking too!",
];
const QUICK_EMOJIS = ["❤️", "😂", "😍", "🔥", "👍", "😭", "🥳", "😮"];

function ChatPage({
  initialUserId,
  onConvOpened,
}: { initialUserId?: number | null; onConvOpened?: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>(
    CONVERSATIONS_INITIAL,
  );
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only when initialUserId changes
  useEffect(() => {
    if (!initialUserId) return;
    const existing = conversations.find((c) => c.user.id === initialUserId);
    if (existing) {
      setActiveConvId(existing.id);
    } else {
      const targetUser = USERS.find((u) => u.id === initialUserId);
      if (targetUser) {
        const newConv: Conversation = {
          id: Date.now(),
          user: targetUser,
          unread: 0,
          lastMessage: "Say hi! 👋",
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        setActiveConvId(newConv.id);
      }
    }
    onConvOpened?.();
  }, [initialUserId]);

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New advanced chat state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pinnedMsg, setPinnedMsg] = useState<Message | null>(null);
  const [msgMenuId, setMsgMenuId] = useState<number | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [showEffects, setShowEffects] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showPostShare, setShowPostShare] = useState(false);
  const [showForward, setShowForward] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [blockedInChat, setBlockedInChat] = useState<Set<number>>(new Set());
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [effectTarget, setEffectTarget] = useState<number | null>(null);
  const [noteTab, setNoteTab] = useState<"song" | "note" | "location">("song");
  const [noteText, setNoteText] = useState("");
  const [pendingEffect, setPendingEffect] = useState<string | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isBlocked = activeConv ? blockedInChat.has(activeConv.user.id) : false;

  function addMessageToConv(msg: Message) {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: [...c.messages, msg],
              lastMessage: msg.text || "📎 Media",
            }
          : c,
      ),
    );
  }

  function buildMsg(overrides: Partial<Message>): Message {
    return {
      id: Date.now(),
      text: "",
      sent: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: [],
      read: false,
      ...overrides,
    };
  }

  function triggerAutoReply() {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply = buildMsg({
        id: Date.now() + 1,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sent: false,
        read: true,
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: [...c.messages, reply],
                lastMessage: reply.text,
              }
            : c,
        ),
      );
    }, 1500);
  }

  function sendMessage() {
    if (!newMessage.trim() || !activeConvId || isBlocked) return;
    const text = newMessage.trim();
    setNewMessage("");
    const msg = buildMsg({
      text,
      replyTo: replyingTo
        ? { id: replyingTo.id, text: replyingTo.text, sent: replyingTo.sent }
        : undefined,
      effect: pendingEffect ?? undefined,
    });
    setReplyingTo(null);
    setPendingEffect(null);
    addMessageToConv(msg);
    triggerAutoReply();
  }

  function addReaction(msgId: number, emoji: string) {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId
                  ? {
                      ...m,
                      reactions: [
                        ...(m.reactions ?? []).filter((r) => r !== emoji),
                        emoji,
                      ],
                    }
                  : m,
              ),
            }
          : c,
      ),
    );
    setHoveredMsgId(null);
  }

  function updateMsg(msgId: number, update: Partial<Message>) {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, ...update } : m,
              ),
            }
          : c,
      ),
    );
  }

  function deleteMsg(msgId: number) {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: c.messages.filter((m) => m.id !== msgId) }
          : c,
      ),
    );
    setMsgMenuId(null);
  }

  function startRecording() {
    setIsRecording(true);
    recordingTimerRef.current = setTimeout(() => {
      stopRecording();
    }, 10000);
  }

  function stopRecording() {
    setIsRecording(false);
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    const msg = buildMsg({
      type: "voice",
      text: "🎙 Voice message",
      duration: `0:${Math.floor(Math.random() * 20 + 5)
        .toString()
        .padStart(2, "0")}`,
    });
    addMessageToConv(msg);
    triggerAutoReply();
  }

  const MOCK_SONGS = [
    { title: "Blinding Lights", artist: "The Weeknd" },
    { title: "Levitating", artist: "Dua Lipa" },
    { title: "Stay", artist: "The Kid LAROI" },
    { title: "As It Was", artist: "Harry Styles" },
  ];

  const MOCK_POSTS = [
    {
      user: "alex_photo",
      caption: "Golden hour magic ✨",
      likes: 1204,
      comments: 87,
      gradient: "linear-gradient(135deg,#f093fb,#f5576c)",
    },
    {
      user: "travel_vibes",
      caption: "Mountains calling 🏔️",
      likes: 892,
      comments: 43,
      gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
    },
    {
      user: "foodie_life",
      caption: "Pasta perfection 🍝",
      likes: 2341,
      comments: 156,
      gradient: "linear-gradient(135deg,#43e97b,#38f9d7)",
    },
  ];

  const STICKERS = [
    "😂",
    "😍",
    "🔥",
    "❤️",
    "🥳",
    "😭",
    "😎",
    "🙏",
    "💯",
    "👻",
    "🎉",
    "🌈",
    "💪",
    "🎸",
    "🦋",
    "🌟",
  ];
  const EFFECTS = [
    { key: "hearts", label: "Hearts", icon: "❤️" },
    { key: "confetti", label: "Confetti", icon: "🎉" },
    { key: "fire", label: "Fire", icon: "🔥" },
    { key: "sparkle", label: "Sparkle", icon: "✨" },
  ];

  const GALLERY_GRADIENTS = [
    "linear-gradient(135deg,#f093fb,#f5576c)",
    "linear-gradient(135deg,#4facfe,#00f2fe)",
    "linear-gradient(135deg,#43e97b,#38f9d7)",
    "linear-gradient(135deg,#fa709a,#fee140)",
    "linear-gradient(135deg,#a18cd1,#fbc2eb)",
    "linear-gradient(135deg,#ffecd2,#fcb69f)",
  ];

  function renderMsgBubble(msg: Message) {
    if (msg.unsent) {
      return (
        <div
          className="px-4 py-2 rounded-2xl text-sm max-w-[70%] italic opacity-50 border border-dashed border-border"
          style={{
            backgroundColor: "var(--app-card)",
            color: "var(--app-text-muted)",
          }}
        >
          Message unsent
        </div>
      );
    }

    if (msg.type === "sticker") {
      return <div className="text-5xl px-2 py-1">{msg.text}</div>;
    }

    if (msg.type === "voice") {
      return (
        <div
          className="px-4 py-3 rounded-2xl max-w-[70%] flex items-center gap-3"
          style={{
            background: msg.sent
              ? "linear-gradient(135deg, #7c3aed, #f97316)"
              : "var(--app-card)",
            color: msg.sent ? "white" : "var(--app-text)",
          }}
        >
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: msg.sent
                ? "rgba(255,255,255,0.25)"
                : "var(--app-bg)",
            }}
          >
            <Play className="w-4 h-4" />
          </button>
          <div className="flex items-end gap-0.5" aria-hidden="true">
            {[
              "w4a",
              "w8b",
              "w12c",
              "w6d",
              "w14e",
              "w10f",
              "w5g",
              "w16h",
              "w9i",
              "w7j",
              "w13k",
              "w11l",
              "w6m",
              "w15n",
              "w8o",
              "w4p",
              "w12q",
              "w10r",
            ].map((id, i) => {
              const waveHeights = [
                4, 8, 12, 6, 14, 10, 5, 16, 9, 7, 13, 11, 6, 15, 8, 4, 12, 10,
              ];
              const h = waveHeights[i];
              return (
                <div
                  key={id}
                  className="w-1 rounded-full"
                  style={{
                    height: `${h}px`,
                    backgroundColor: msg.sent
                      ? "rgba(255,255,255,0.7)"
                      : "var(--app-text-muted)",
                  }}
                />
              );
            })}
          </div>
          <span className="text-xs opacity-70">{msg.duration}</span>
        </div>
      );
    }

    if (msg.type === "image") {
      return (
        <div className="rounded-2xl overflow-hidden max-w-[200px]">
          <div
            className="w-[200px] h-[200px]"
            style={{
              background:
                msg.imageUrl || "linear-gradient(135deg,#4facfe,#00f2fe)",
            }}
          />
        </div>
      );
    }

    if (msg.type === "post") {
      const pd = msg.postData;
      return (
        <div
          className="rounded-2xl overflow-hidden max-w-[240px] border border-border"
          style={{ backgroundColor: "var(--app-card)" }}
        >
          <div
            className="h-[140px] w-full"
            style={{
              background:
                pd?.gradient || "linear-gradient(135deg,#f093fb,#f5576c)",
            }}
          />
          <div className="p-3">
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--app-text)" }}
            >
              @{pd?.user}
            </p>
            <p
              className="text-xs mt-0.5 truncate"
              style={{ color: "var(--app-text-muted)" }}
            >
              {pd?.caption}
            </p>
            <div
              className="flex gap-3 mt-2 text-xs"
              style={{ color: "var(--app-text-muted)" }}
            >
              <span>❤️ {pd?.likes}</span>
              <span>💬 {pd?.comments}</span>
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === "note") {
      const nd = msg.noteData;
      const bgMap: Record<string, string> = {
        song: "linear-gradient(135deg, #7c3aed, #f97316)",
        note: "linear-gradient(135deg,#f59e0b,#d97706)",
        location: "linear-gradient(135deg,#22c55e,#15803d)",
      };
      const iconMap: Record<string, string> = {
        song: "🎵",
        note: "📝",
        location: "📍",
      };
      return (
        <div
          className="px-4 py-3 rounded-2xl max-w-[220px]"
          style={{ background: bgMap[nd?.kind || "note"] }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{iconMap[nd?.kind || "note"]}</span>
            <div>
              <p className="text-white text-sm font-semibold">{nd?.title}</p>
              {nd?.subtitle && (
                <p className="text-white/70 text-xs">{nd.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default text bubble
    return (
      <div
        className="px-4 py-2 rounded-2xl text-sm max-w-[70%]"
        style={{
          background: msg.sent
            ? "linear-gradient(135deg, #7c3aed, #f97316)"
            : "var(--app-card)",
          color: msg.sent ? "white" : "var(--app-text)",
          borderBottomRightRadius: msg.sent ? 4 : undefined,
          borderBottomLeftRadius: !msg.sent ? 4 : undefined,
        }}
      >
        {msg.replyTo && (
          <div className="mb-2 pl-2 border-l-2 border-white/40 text-xs opacity-70 truncate">
            {msg.replyTo.text}
          </div>
        )}
        <p>{msg.text}</p>
        <div
          className={`flex items-center gap-1 mt-1 ${msg.sent ? "justify-end" : "justify-start"}`}
        >
          <p className="text-[10px] opacity-70">{msg.time}</p>
          {msg.sent && (
            <div className="flex">
              <Check className="w-3 h-3 opacity-70" />
              <Check className="w-3 h-3 -ml-1.5 opacity-70" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-border"
      data-ocid="chat.panel"
    >
      {/* Conversation list */}
      <div
        className={`flex-shrink-0 w-full md:w-72 border-r border-border flex flex-col ${activeConv ? "hidden md:flex" : "flex"}`}
        style={{ backgroundColor: "var(--app-card)" }}
      >
        <div className="p-4 border-b border-border">
          <h2
            className="font-semibold text-base mb-3"
            style={{ color: "var(--app-text)" }}
          >
            Messages
          </h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--app-text-muted)" }}
            />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full text-sm border-border"
              style={{
                backgroundColor: "var(--app-bg)",
                color: "var(--app-text)",
              }}
              data-ocid="chat.search_input"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv, i) => (
            <button
              type="button"
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors ${activeConvId === conv.id ? "bg-muted" : ""}`}
              data-ocid={`chat.item.${i + 1}`}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                  <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                </Avatar>
                {ONLINE_USER_IDS.has(conv.user.id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
                )}
                {conv.unread > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                    style={{ backgroundColor: "var(--app-badge)" }}
                  >
                    {conv.unread}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold truncate"
                  style={{ color: "var(--app-text)" }}
                >
                  {conv.user.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active chat */}
      {activeConv ? (
        <div
          className="flex-1 flex flex-col min-w-0"
          style={{ backgroundColor: "var(--app-bg)" }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-border"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            <button
              type="button"
              onClick={() => setActiveConvId(null)}
              className="md:hidden p-1 rounded-full hover:bg-muted"
              data-ocid="chat.close_button"
            >
              <ArrowLeft
                className="w-5 h-5"
                style={{ color: "var(--app-text)" }}
              />
            </button>
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={activeConv.user.avatar}
                  alt={activeConv.user.name}
                />
                <AvatarFallback>{activeConv.user.name[0]}</AvatarFallback>
              </Avatar>
              {ONLINE_USER_IDS.has(activeConv.user.id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background bg-green-500" />
              )}
            </div>
            <div className="flex-1">
              <p
                className="font-semibold text-sm"
                style={{ color: "var(--app-text)" }}
              >
                {activeConv.user.name}
              </p>
              <p
                className="text-xs"
                style={{
                  color: ONLINE_USER_IDS.has(activeConv.user.id)
                    ? "#4CAF50"
                    : "var(--app-text-muted)",
                }}
              >
                {ONLINE_USER_IDS.has(activeConv.user.id) ? "Online" : "Offline"}
              </p>
            </div>
            {/* Header action buttons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-muted"
                title="Voice Call"
                data-ocid="chat.secondary_button"
              >
                <PhoneCall
                  className="w-4 h-4"
                  style={{ color: "var(--app-text-muted)" }}
                />
              </button>
              <button
                type="button"
                className="p-2 rounded-full hover:bg-muted"
                title="Video Call"
                data-ocid="chat.secondary_button"
              >
                <Video
                  className="w-4 h-4"
                  style={{ color: "var(--app-text-muted)" }}
                />
              </button>
              <DropdownMenu open={showChatMenu} onOpenChange={setShowChatMenu}>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-2 rounded-full hover:bg-muted"
                    data-ocid="chat.dropdown_menu"
                  >
                    <MoreVertical
                      className="w-4 h-4"
                      style={{ color: "var(--app-text-muted)" }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => toast.success("Notifications muted")}
                  >
                    🔔 Mute notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toast.info("Search coming soon")}
                  >
                    🔍 Search in chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setBlockedInChat((prev) => {
                        const next = new Set(prev);
                        if (next.has(activeConv.user.id)) {
                          next.delete(activeConv.user.id);
                          toast.success(`Unblocked ${activeConv.user.name}`);
                        } else {
                          next.add(activeConv.user.id);
                          toast.success(`Blocked ${activeConv.user.name}`);
                        }
                        return next;
                      });
                      setShowChatMenu(false);
                    }}
                    data-ocid="chat.delete_button"
                  >
                    🚫{" "}
                    {blockedInChat.has(activeConv.user.id)
                      ? "Unblock user"
                      : "Block user"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Pinned message banner */}
          {pinnedMsg && (
            <div
              className="flex items-center gap-2 px-4 py-2 border-b border-border"
              style={{
                background:
                  "linear-gradient(90deg,rgba(255,107,157,0.15),rgba(196,77,255,0.15))",
              }}
            >
              <Pin
                className="w-3 h-3 flex-shrink-0"
                style={{ color: "var(--app-text-muted)" }}
              />
              <p
                className="text-xs flex-1 truncate"
                style={{ color: "var(--app-text)" }}
              >
                📌 {pinnedMsg.text || "Pinned message"}
              </p>
              <button
                type="button"
                onClick={() => setPinnedMsg(null)}
                data-ocid="chat.close_button"
              >
                <X
                  className="w-3 h-3"
                  style={{ color: "var(--app-text-muted)" }}
                />
              </button>
            </div>
          )}

          {/* Blocked banner */}
          {isBlocked && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 border-b border-destructive/30 bg-destructive/10">
              <p className="text-xs text-destructive font-medium">
                You have blocked this user
              </p>
            </div>
          )}

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2"
            data-ocid="chat.list"
          >
            {activeConv.messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex flex-col relative ${msg.sent ? "items-end" : "items-start"}`}
                onMouseEnter={() => setHoveredMsgId(msg.id)}
                onMouseLeave={() => {
                  setHoveredMsgId(null);
                  if (msgMenuId === msg.id) setMsgMenuId(null);
                }}
                data-ocid={`chat.item.${i + 1}`}
              >
                {/* Reaction bar on hover for received messages */}
                {!msg.sent && !msg.unsent && hoveredMsgId === msg.id && (
                  <div
                    className="flex gap-1 mb-1 px-2 py-1 rounded-full shadow-lg border border-border"
                    style={{ backgroundColor: "var(--app-card)" }}
                  >
                    {["❤️", "😂", "👍", "😮", "😢"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="text-sm hover:scale-125 transition-transform"
                        onClick={() => addReaction(msg.id, emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                    {/* Remix button */}
                    <button
                      type="button"
                      className="text-sm hover:scale-125 transition-transform ml-1 px-1 rounded text-xs font-medium"
                      style={{ color: "var(--app-text-muted)" }}
                      onClick={() => {
                        const remixMsg = buildMsg({
                          text: "✨ Remixed this!",
                          sent: true,
                        });
                        addMessageToConv(remixMsg);
                        triggerAutoReply();
                      }}
                    >
                      🔀
                    </button>
                  </div>
                )}

                <div className="relative">
                  {renderMsgBubble(msg)}
                  {/* Message ⋯ menu trigger */}
                  {hoveredMsgId === msg.id && !msg.unsent && (
                    <button
                      type="button"
                      className={`absolute top-0 ${msg.sent ? "-left-7" : "-right-7"} p-1 rounded-full opacity-70 hover:opacity-100`}
                      style={{ backgroundColor: "var(--app-card)" }}
                      onClick={() =>
                        setMsgMenuId(msgMenuId === msg.id ? null : msg.id)
                      }
                      data-ocid="chat.dropdown_menu"
                    >
                      <MoreHorizontal
                        className="w-3 h-3"
                        style={{ color: "var(--app-text)" }}
                      />
                    </button>
                  )}
                  {/* Context menu */}
                  {msgMenuId === msg.id && (
                    <div
                      className={`absolute ${msg.sent ? "right-0" : "left-0"} top-6 z-50 rounded-xl shadow-xl border border-border overflow-hidden`}
                      style={{
                        backgroundColor: "var(--app-card)",
                        minWidth: 160,
                      }}
                    >
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        style={{ color: "var(--app-text)" }}
                        onClick={() => {
                          setReplyingTo(msg);
                          setMsgMenuId(null);
                        }}
                        data-ocid="chat.secondary_button"
                      >
                        ↩ Reply
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        style={{ color: "var(--app-text)" }}
                        onClick={() => {
                          setForwardMsg(msg);
                          setShowForward(true);
                          setMsgMenuId(null);
                        }}
                        data-ocid="chat.secondary_button"
                      >
                        <Forward className="w-3 h-3" /> Forward
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        style={{ color: "var(--app-text)" }}
                        onClick={() => {
                          navigator.clipboard?.writeText(msg.text || "");
                          toast.success("Copied");
                          setMsgMenuId(null);
                        }}
                        data-ocid="chat.secondary_button"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        style={{ color: "var(--app-text)" }}
                        onClick={() => {
                          updateMsg(msg.id, { saved: !msg.saved });
                          toast.success(
                            msg.saved ? "Removed from saved" : "Saved",
                          );
                          setMsgMenuId(null);
                        }}
                        data-ocid="chat.toggle"
                      >
                        <Bookmark className="w-3 h-3" />{" "}
                        {msg.saved ? "Unsave" : "Save"}
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        style={{ color: "var(--app-text)" }}
                        onClick={() => {
                          setPinnedMsg(msg);
                          toast.success("Message pinned");
                          setMsgMenuId(null);
                        }}
                        data-ocid="chat.toggle"
                      >
                        <Pin className="w-3 h-3" /> Pin
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
                        style={{ color: "var(--app-text)" }}
                        onClick={() => {
                          setEffectTarget(msg.id);
                          setShowEffects(true);
                          setMsgMenuId(null);
                        }}
                        data-ocid="chat.secondary_button"
                      >
                        <Sparkles className="w-3 h-3" /> Add Effect
                      </button>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left text-destructive"
                        onClick={() => deleteMsg(msg.id)}
                        data-ocid="chat.delete_button"
                      >
                        <Trash2 className="w-3 h-3" /> Delete for you
                      </button>
                      {msg.sent && (
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left text-destructive"
                          onClick={() => {
                            updateMsg(msg.id, { unsent: true });
                            setMsgMenuId(null);
                            toast.success("Message unsent");
                          }}
                          data-ocid="chat.delete_button"
                        >
                          <X className="w-3 h-3" /> Unsend
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Reactions display */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div
                    className="flex gap-0.5 mt-0.5 px-1 py-0.5 rounded-full border border-border text-xs"
                    style={{ backgroundColor: "var(--app-card)" }}
                  >
                    {msg.reactions.map((r) => (
                      <span key={r}>{r}</span>
                    ))}
                  </div>
                )}

                {/* Effect badge */}
                {msg.effect && (
                  <div className="text-xs mt-0.5 opacity-70">
                    {EFFECTS.find((e) => e.key === msg.effect)?.icon}{" "}
                    {EFFECTS.find((e) => e.key === msg.effect)?.label}
                  </div>
                )}

                {/* Saved badge */}
                {msg.saved && (
                  <Bookmark
                    className="w-3 h-3 mt-0.5 fill-current"
                    style={{ color: "#f59e0b" }}
                  />
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-start">
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center"
                  style={{ backgroundColor: "var(--app-card)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full bg-current opacity-50 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-current opacity-50 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-current opacity-50 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick emoji bar */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-t border-border overflow-x-auto"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="text-lg hover:scale-125 transition-transform flex-shrink-0"
                onClick={() => setNewMessage((prev) => prev + emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply bar */}
          {replyingTo && (
            <div
              className="flex items-center gap-2 px-4 py-2 border-t border-border"
              style={{
                background:
                  "linear-gradient(90deg,rgba(255,107,157,0.08),rgba(196,77,255,0.08))",
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--app-badge)" }}
                >
                  ↩ Replying to{" "}
                  {replyingTo.sent ? "yourself" : activeConv.user.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {replyingTo.text}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="p-1"
                data-ocid="chat.close_button"
              >
                <X
                  className="w-4 h-4"
                  style={{ color: "var(--app-text-muted)" }}
                />
              </button>
            </div>
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-3 px-4 py-2 border-t border-border bg-red-500/10">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="flex items-end gap-0.5">
                {[
                  ["r6a", 6, 0],
                  ["r10b", 10, 80],
                  ["r14c", 14, 160],
                  ["r8d", 8, 240],
                  ["r12e", 12, 320],
                  ["r16f", 16, 400],
                  ["r7g", 7, 480],
                  ["r11h", 11, 560],
                  ["r9i", 9, 640],
                  ["r13j", 13, 720],
                  ["r5k", 5, 800],
                  ["r15l", 15, 880],
                ].map(([id, h, delay]) => (
                  <div
                    key={id as string}
                    className="w-1 rounded-full bg-red-400 animate-bounce"
                    style={{ height: `${h}px`, animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
              <span className="text-xs text-red-500 font-medium flex-1">
                Recording...
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="text-xs text-white bg-red-500 px-3 py-1 rounded-full font-medium"
                data-ocid="chat.secondary_button"
              >
                Stop
              </button>
            </div>
          )}

          {/* Input toolbar */}
          {!isBlocked && (
            <div
              className="border-t border-border"
              style={{ backgroundColor: "var(--app-card)" }}
            >
              {/* Toolbar icons row */}
              <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                <button
                  type="button"
                  title="Camera"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => setShowCamera(true)}
                  data-ocid="chat.secondary_button"
                >
                  <Camera
                    className="w-5 h-5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
                <button
                  type="button"
                  title="Gallery"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => setShowGallery(true)}
                  data-ocid="chat.secondary_button"
                >
                  <Image
                    className="w-5 h-5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
                <button
                  type="button"
                  title="Voice"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={isRecording ? stopRecording : startRecording}
                  data-ocid="chat.toggle"
                >
                  {isRecording ? (
                    <MicOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Mic
                      className="w-5 h-5"
                      style={{ color: "var(--app-text-muted)" }}
                    />
                  )}
                </button>
                <button
                  type="button"
                  title="Stickers"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => {
                    setShowStickers(true);
                    setShowEffects(false);
                    setShowNotes(false);
                  }}
                  data-ocid="chat.secondary_button"
                >
                  <Sticker
                    className="w-5 h-5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
                <button
                  type="button"
                  title="Effects"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => {
                    setShowEffects(true);
                    setShowStickers(false);
                    setShowNotes(false);
                    setEffectTarget(null);
                  }}
                  data-ocid="chat.secondary_button"
                >
                  <Sparkles
                    className="w-5 h-5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
                <button
                  type="button"
                  title="Share Post"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => setShowPostShare(true)}
                  data-ocid="chat.secondary_button"
                >
                  <Share2
                    className="w-5 h-5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
                <button
                  type="button"
                  title="Notes"
                  className="p-2 rounded-full hover:bg-muted"
                  onClick={() => {
                    setShowNotes(true);
                    setShowStickers(false);
                    setShowEffects(false);
                  }}
                  data-ocid="chat.secondary_button"
                >
                  <FileText
                    className="w-5 h-5"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
              </div>
              {/* Input row */}
              <div className="flex items-center gap-2 px-3 pb-3">
                <Input
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="rounded-full border-border flex-1"
                  style={{
                    backgroundColor: "var(--app-bg)",
                    color: "var(--app-text)",
                  }}
                  data-ocid="chat.input"
                />
                <Button
                  onClick={sendMessage}
                  size="sm"
                  className="rounded-full px-4 text-white flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #f97316)",
                    border: "none",
                  }}
                  data-ocid="chat.submit_button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Sticker panel */}
          {showStickers && (
            <div
              className="border-t border-border p-3"
              style={{ backgroundColor: "var(--app-card)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--app-text)" }}
                >
                  Stickers
                </span>
                <button
                  type="button"
                  onClick={() => setShowStickers(false)}
                  data-ocid="chat.close_button"
                >
                  <X
                    className="w-4 h-4"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
              </div>
              <div className="grid grid-cols-8 gap-1">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="text-2xl hover:scale-125 transition-transform p-1"
                    onClick={() => {
                      const msg = buildMsg({ type: "sticker", text: s });
                      addMessageToConv(msg);
                      setShowStickers(false);
                      triggerAutoReply();
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Effects panel */}
          {showEffects && (
            <div
              className="border-t border-border p-3"
              style={{ backgroundColor: "var(--app-card)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--app-text)" }}
                >
                  Effects
                </span>
                <button
                  type="button"
                  onClick={() => setShowEffects(false)}
                  data-ocid="chat.close_button"
                >
                  <X
                    className="w-4 h-4"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
              </div>
              <div className="flex gap-3">
                {EFFECTS.map((ef) => (
                  <button
                    key={ef.key}
                    type="button"
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted transition-colors"
                    onClick={() => {
                      if (effectTarget !== null) {
                        updateMsg(effectTarget, { effect: ef.key });
                        toast.success(`${ef.icon} Effect added!`);
                        setEffectTarget(null);
                      } else {
                        setPendingEffect(ef.key);
                        toast.success(
                          `${ef.icon} Effect will apply to next message`,
                        );
                      }
                      setShowEffects(false);
                    }}
                    data-ocid="chat.toggle"
                  >
                    <span className="text-2xl">{ef.icon}</span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      {ef.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes panel */}
          {showNotes && (
            <div
              className="border-t border-border p-3"
              style={{ backgroundColor: "var(--app-card)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--app-text)" }}
                >
                  Notes
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotes(false)}
                  data-ocid="chat.close_button"
                >
                  <X
                    className="w-4 h-4"
                    style={{ color: "var(--app-text-muted)" }}
                  />
                </button>
              </div>
              {/* Note tabs */}
              <div className="flex gap-2 mb-3">
                {(["song", "note", "location"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${noteTab === t ? "text-white" : ""}`}
                    style={{
                      background:
                        noteTab === t
                          ? "linear-gradient(135deg, #7c3aed, #f97316)"
                          : "var(--app-bg)",
                      color: noteTab === t ? "white" : "var(--app-text-muted)",
                    }}
                    onClick={() => setNoteTab(t)}
                    data-ocid="chat.tab"
                  >
                    {t === "song"
                      ? "🎵 Song"
                      : t === "note"
                        ? "📝 Note"
                        : "📍 Location"}
                  </button>
                ))}
              </div>
              {noteTab === "song" && (
                <div className="flex flex-col gap-1">
                  {MOCK_SONGS.map((song) => (
                    <button
                      key={song.title}
                      type="button"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
                      onClick={() => {
                        const msg = buildMsg({
                          type: "note",
                          text: `🎵 ${song.title}`,
                          noteData: {
                            kind: "song",
                            title: song.title,
                            subtitle: song.artist,
                          },
                        });
                        addMessageToConv(msg);
                        setShowNotes(false);
                        triggerAutoReply();
                      }}
                      data-ocid="chat.secondary_button"
                    >
                      <Music
                        className="w-8 h-8 p-1.5 rounded-full text-white flex-shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #7c3aed, #f97316)",
                        }}
                      />
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          {song.title}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          {song.artist}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {noteTab === "note" && (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none"
                    style={{
                      backgroundColor: "var(--app-bg)",
                      color: "var(--app-text)",
                    }}
                    rows={3}
                    placeholder="Write a note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    data-ocid="chat.textarea"
                  />
                  <Button
                    size="sm"
                    disabled={!noteText.trim()}
                    onClick={() => {
                      const msg = buildMsg({
                        type: "note",
                        text: `📝 ${noteText}`,
                        noteData: { kind: "note", title: noteText },
                      });
                      addMessageToConv(msg);
                      setNoteText("");
                      setShowNotes(false);
                      triggerAutoReply();
                    }}
                    style={{
                      background: "linear-gradient(135deg,#f59e0b,#d97706)",
                      border: "none",
                      color: "white",
                    }}
                    data-ocid="chat.submit_button"
                  >
                    Send Note
                  </Button>
                </div>
              )}
              {noteTab === "location" && (
                <div className="flex flex-col gap-2">
                  <div
                    className="w-full h-28 rounded-lg overflow-hidden flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg,#22c55e,#15803d)",
                    }}
                  >
                    <div className="text-center text-white">
                      <MapPin className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-sm font-medium">Mumbai, India</p>
                      <p className="text-xs opacity-70">
                        19.0760° N, 72.8777° E
                      </p>
                    </div>
                  </div>
                  {[
                    "Mumbai, India",
                    "Delhi, India",
                    "New York, USA",
                    "London, UK",
                  ].map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted text-left"
                      onClick={() => {
                        const msg = buildMsg({
                          type: "note",
                          text: `📍 ${city}`,
                          noteData: { kind: "location", title: city },
                        });
                        addMessageToConv(msg);
                        setShowNotes(false);
                        triggerAutoReply();
                      }}
                      data-ocid="chat.secondary_button"
                    >
                      <MapPin
                        className="w-4 h-4"
                        style={{ color: "#22c55e" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--app-text)" }}
                      >
                        {city}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex-1 hidden md:flex flex-col items-center justify-center"
          style={{ backgroundColor: "var(--app-bg)" }}
        >
          <MessageCircle
            className="w-16 h-16 mb-4"
            style={{ color: "var(--app-text-muted)" }}
          />
          <p
            className="text-base font-semibold"
            style={{ color: "var(--app-text)" }}
          >
            Your Messages
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--app-text-muted)" }}
          >
            Select a conversation to start chatting
          </p>
        </div>
      )}

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-sm" data-ocid="chat.modal">
          <DialogHeader>
            <DialogTitle>Camera</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full h-52 rounded-xl bg-gray-900 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Camera Preview</p>
              </div>
            </div>
            <button
              type="button"
              className="w-14 h-14 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-colors"
              onClick={() => {
                const gradient =
                  GALLERY_GRADIENTS[
                    Math.floor(Math.random() * GALLERY_GRADIENTS.length)
                  ];
                const msg = buildMsg({
                  type: "image",
                  text: "📷 Photo",
                  imageUrl: gradient,
                });
                addMessageToConv(msg);
                setShowCamera(false);
                triggerAutoReply();
                toast.success("Photo sent!");
              }}
              data-ocid="chat.primary_button"
            >
              <Camera className="w-6 h-6 mx-auto text-white" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Modal */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-sm" data-ocid="chat.modal">
          <DialogHeader>
            <DialogTitle>Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-1">
            {GALLERY_GRADIENTS.map((gradient, idx) => (
              <button
                key={gradient}
                type="button"
                className="rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                onClick={() => {
                  const msg = buildMsg({
                    type: "image",
                    text: "🖼 Image",
                    imageUrl: gradient,
                  });
                  addMessageToConv(msg);
                  setShowGallery(false);
                  triggerAutoReply();
                }}
                data-ocid={`chat.item.${idx + 1}`}
              >
                <div className="w-full h-24" style={{ background: gradient }} />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Share Modal */}
      <Dialog open={showPostShare} onOpenChange={setShowPostShare}>
        <DialogContent className="max-w-sm" data-ocid="chat.modal">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            {MOCK_POSTS.map((post, idx) => (
              <button
                key={post.user}
                type="button"
                className="flex gap-3 items-center p-2 rounded-xl hover:bg-muted text-left border border-border"
                onClick={() => {
                  const msg = buildMsg({
                    type: "post",
                    text: `Shared: ${post.caption}`,
                    postData: post,
                  });
                  addMessageToConv(msg);
                  setShowPostShare(false);
                  triggerAutoReply();
                  toast.success("Post shared!");
                }}
                data-ocid={`chat.item.${idx + 1}`}
              >
                <div
                  className="w-14 h-14 rounded-lg flex-shrink-0"
                  style={{ background: post.gradient }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--app-text)" }}
                  >
                    @{post.user}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    {post.caption}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    ❤️ {post.likes}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Forward Modal */}
      <Dialog open={showForward} onOpenChange={setShowForward}>
        <DialogContent className="max-w-sm" data-ocid="chat.modal">
          <DialogHeader>
            <DialogTitle>Forward to...</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {conversations.map((conv, idx) => (
              <button
                key={conv.id}
                type="button"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
                onClick={() => {
                  if (forwardMsg) {
                    const fwdMsg = buildMsg({
                      ...forwardMsg,
                      id: Date.now(),
                      text: `↪ ${forwardMsg.text}`,
                    });
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === conv.id
                          ? {
                              ...c,
                              messages: [...c.messages, fwdMsg],
                              lastMessage: fwdMsg.text,
                            }
                          : c,
                      ),
                    );
                    toast.success(`Forwarded to ${conv.user.name}`);
                  }
                  setShowForward(false);
                  setForwardMsg(null);
                }}
                data-ocid={`chat.item.${idx + 1}`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={conv.user.avatar} alt={conv.user.name} />
                  <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm" style={{ color: "var(--app-text)" }}>
                  {conv.user.name}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────

function ProfilePage({
  darkMode,
  onToggleDark,
  principal,
  loginMethod,
  onLogout,
  profile,
  onEditProfile,
  followedUsers,
  onToggleFollow,
  posts,
  onBookmark,
}: {
  darkMode: boolean;
  onToggleDark: () => void;
  principal?: string;
  loginMethod?: "internet-identity" | "email";
  onLogout?: () => void;
  profile: ProfileState;
  onEditProfile: () => void;
  followedUsers: Set<number>;
  onToggleFollow: (id: number) => void;
  posts: Post[];
  onBookmark: (id: number) => void;
}) {
  const [isPrivate, setIsPrivate] = useState(CURRENT_USER.isPrivate);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersSearch, setFollowersSearch] = useState("");
  const [followingSearch, setFollowingSearch] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState<
    "posts" | "saved" | "tagged"
  >("posts");
  const [savedSubTab, setSavedSubTab] = useState<"posts" | "reels">("posts");
  const [savedPostsSearch, setSavedPostsSearch] = useState("");
  const [savedPostsFilter, setSavedPostsFilter] = useState<
    "all" | "captioned" | "location" | "mood"
  >("all");
  const [savedReelsSearch, setSavedReelsSearch] = useState("");
  const [selectedSavedPost, setSelectedSavedPost] = useState<Post | null>(null);
  const [selectedSavedReel, setSelectedSavedReel] = useState<Reel | null>(null);
  const [savedReelLiked, setSavedReelLiked] = useState<Set<number>>(new Set());
  const [savedPostLiked, setSavedPostLiked] = useState<Set<number>>(new Set());
  const [selectedTaggedPost, setSelectedTaggedPost] = useState<{
    id: number;
    image: string;
  } | null>(null);
  const [savedReelShareOpen, setSavedReelShareOpen] = useState(false);
  const [showOwnProfileShareModal, setShowOwnProfileShareModal] =
    useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  // Account Centre state
  const [acSection, setAcSection] = useState<string | null>(null);
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [syncProfilePic, setSyncProfilePic] = useState(true);
  const [sharingAcrossProfile, setSharingAcrossProfile] = useState(false);
  const [memoriesEnabled, setMemoriesEnabled] = useState(true);
  const [showProfileLink, setShowProfileLink] = useState(true);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showSecurityCheckup, setShowSecurityCheckup] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [showUpgradePro, setShowUpgradePro] = useState(false);
  const [staticPage, setStaticPage] = useState<
    "about" | "privacy" | "terms" | "contact" | null
  >(null);
  const referralCode = `CONNECT-${profile.username.toUpperCase()}-2024`;
  const referralData = (() => {
    try {
      const stored = localStorage.getItem(
        `connectly_referral_${profile.username}`,
      );
      return stored ? JSON.parse(stored) : { invited: 3, points: 150 };
    } catch {
      return { invited: 3, points: 150 };
    }
  })();
  const [selectedProfilePost, setSelectedProfilePost] = useState<{
    id: number;
    image: string;
    caption?: string;
    location?: string;
    mood?: string;
  } | null>(null);
  const [profilePostLiked, setProfilePostLiked] = useState<Set<number>>(
    new Set(),
  );
  const [profilePostCommentInput, setProfilePostCommentInput] = useState("");
  const [profilePostComments, setProfilePostComments] = useState<
    Record<
      number,
      {
        id: number;
        text: string;
        username: string;
        replies: { id: number; text: string; username: string }[];
      }[]
    >
  >({});
  const [profilePostReplyingTo, setProfilePostReplyingTo] = useState<
    number | null
  >(null);
  const [profilePostReplyInputs, setProfilePostReplyInputs] = useState<
    Record<number, string>
  >({});
  const [profilePostExpandedReplies, setProfilePostExpandedReplies] = useState<
    Record<number, boolean>
  >({});
  const [taggedLiked, setTaggedLiked] = useState<Set<number>>(new Set());
  const [taggedAuthorFollowed, setTaggedAuthorFollowed] = useState(false);
  const [taggedCommentInput, setTaggedCommentInput] = useState("");
  const [taggedComments, setTaggedComments] = useState<
    Record<
      number,
      {
        id: number;
        text: string;
        username: string;
        replies: { id: number; text: string; username: string }[];
      }[]
    >
  >({});
  const [taggedReplyingTo, setTaggedReplyingTo] = useState<number | null>(null);
  const [taggedReplyInputs, setTaggedReplyInputs] = useState<
    Record<number, string>
  >({});
  const [taggedExpandedReplies, setTaggedExpandedReplies] = useState<
    Record<number, boolean>
  >({});
  const savedReelIds: number[] = JSON.parse(
    localStorage.getItem("connectly_saved_reels") || "[]",
  );
  const savedReelsList = REELS.filter((r) => savedReelIds.includes(r.id));
  const PROFILE_CAPTIONS = [
    "Golden hour magic ✨",
    "Good vibes only 🌈",
    "Living my best life 💫",
    "Exploring new horizons 🌍",
    "Chasing sunsets 🌅",
    "Coffee and good books ☕📚",
    "Weekend adventures 🏞️",
    "Music is life 🎵",
    "Stay positive 🌸",
  ];
  const profilePosts = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    image: `https://picsum.photos/seed/profile${i + 1}/300/300`,
    caption: PROFILE_CAPTIONS[i],
  }));

  return (
    <>
      <div className="flex flex-col gap-6 pb-4" data-ocid="profile.page">
        {/* Header */}
        <div
          className="rounded-xl border border-border overflow-hidden"
          style={{ backgroundColor: "var(--app-card)" }}
        >
          {/* Cover Photo */}
          <button
            type="button"
            className="relative w-full group cursor-pointer"
            style={{ height: 120 }}
            onClick={onEditProfile}
            data-ocid="profile.cover.edit_button"
          >
            {profile.coverPhoto ? (
              <img
                src={profile.coverPhoto}
                alt="cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #f97316)",
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
              <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <Camera className="w-4 h-4" /> Change Cover
              </span>
            </div>
          </button>
          <div className="flex items-start gap-5 p-6 pt-3">
            <div className="relative -mt-10">
              <button
                type="button"
                className="relative group block focus:outline-none"
                onClick={onEditProfile}
                data-ocid="profile.avatar.edit_button"
              >
                <div
                  style={{
                    background:
                      "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                    padding: 3,
                    borderRadius: "50%",
                  }}
                >
                  <div className="bg-background rounded-full p-1">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar} alt={profile.name} />
                      <AvatarFallback>Y</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h1
                  className="text-xl font-bold"
                  style={{ color: "var(--app-text)" }}
                >
                  {profile.username}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-border text-sm h-8 px-4"
                    onClick={onEditProfile}
                    data-ocid="profile.edit_button"
                  >
                    Edit Profile
                  </Button>
                  <button
                    type="button"
                    onClick={onToggleDark}
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                    data-ocid="profile.toggle"
                  >
                    {darkMode ? (
                      <Sun
                        className="w-4 h-4"
                        style={{ color: "var(--app-text)" }}
                      />
                    ) : (
                      <Moon
                        className="w-4 h-4"
                        style={{ color: "var(--app-text)" }}
                      />
                    )}
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                    data-ocid="profile.button"
                  >
                    <Settings
                      className="w-4 h-4"
                      style={{ color: "var(--app-text)" }}
                    />
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="p-2 rounded-lg border border-destructive hover:bg-destructive/10 transition-colors"
                      title="Logout"
                      data-ocid="profile.delete_button"
                    >
                      <LogOut className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm mt-1" style={{ color: "var(--app-text)" }}>
                {profile.name}
              </p>
              {profile.bio && (
                <p
                  className="text-[10px] font-semibold uppercase tracking-wider mt-2"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  Description
                </p>
              )}
              <p
                className="text-sm mt-1"
                style={{ color: "var(--app-text-muted)" }}
              >
                {profile.bio}
              </p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs flex items-center gap-1 mt-1 hover:underline"
                  style={{ color: "#60a5fa" }}
                  data-ocid="profile.website.link"
                >
                  🔗 {profile.website}
                </a>
              )}
              {principal && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit"
                    style={{ backgroundColor: "var(--app-card)" }}
                  >
                    <Shield
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: "#7c3aed" }}
                    />
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      {principal.slice(0, 12)}...
                    </span>
                  </div>
                  {loginMethod && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={
                        loginMethod === "internet-identity"
                          ? {
                              background: "rgba(196,77,255,0.15)",
                              color: "#7c3aed",
                            }
                          : {
                              background: "rgba(255,107,157,0.15)",
                              color: "#f97316",
                            }
                      }
                    >
                      {loginMethod === "internet-identity"
                        ? "🔐 Biometric"
                        : "📧 Email/Password"}
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-6 mt-3">
                <div className="text-center">
                  <p
                    className="font-bold text-base"
                    style={{ color: "var(--app-text)" }}
                  >
                    {formatCount(CURRENT_USER.posts)}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Posts
                  </p>
                </div>
                <button
                  type="button"
                  className="text-center hover:opacity-70"
                  onClick={() => setShowFollowersModal(true)}
                  data-ocid="profile.followers.button"
                >
                  <p
                    className="font-bold text-base"
                    style={{ color: "var(--app-text)" }}
                  >
                    {formatCount(CURRENT_USER.followers)}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Followers
                  </p>
                </button>
                <button
                  type="button"
                  className="text-center hover:opacity-70"
                  onClick={() => setShowFollowingModal(true)}
                  data-ocid="profile.following.button"
                >
                  <p
                    className="font-bold text-base"
                    style={{ color: "var(--app-text)" }}
                  >
                    {formatCount(CURRENT_USER.following)}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Following
                  </p>
                </button>
              </div>
              {/* Invite Friends Button */}
              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 text-white"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #f97316)",
                }}
                data-ocid="profile.invite.button"
              >
                🎁 Invite Friends
                <span className="text-xs opacity-80">
                  ⭐ {referralData.points} pts
                </span>
              </button>

              {/* Referral Modal */}
              <Dialog
                open={showReferralModal}
                onOpenChange={setShowReferralModal}
              >
                <DialogContent
                  className="max-w-sm"
                  data-ocid="profile.referral.modal"
                >
                  <DialogHeader>
                    <DialogTitle>🎁 Invite Friends</DialogTitle>
                    <DialogDescription>
                      Share your referral code and earn rewards!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div
                      className="rounded-xl p-4 text-center"
                      style={{
                        backgroundColor: "var(--app-bg)",
                        border: "1px solid var(--app-border)",
                      }}
                    >
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        Your Referral Code
                      </p>
                      <p
                        className="text-lg font-extrabold tracking-widest"
                        style={{ color: "var(--app-accent)" }}
                      >
                        {referralCode}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="rounded-xl p-3 text-center"
                        style={{
                          backgroundColor: "var(--app-card)",
                          border: "1px solid var(--app-border)",
                        }}
                      >
                        <p
                          className="text-xl font-bold"
                          style={{ color: "var(--app-text)" }}
                        >
                          {referralData.invited}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Friends Invited
                        </p>
                      </div>
                      <div
                        className="rounded-xl p-3 text-center"
                        style={{
                          backgroundColor: "var(--app-card)",
                          border: "1px solid var(--app-border)",
                        }}
                      >
                        <p
                          className="text-xl font-bold"
                          style={{ color: "var(--app-accent)" }}
                        >
                          ⭐ {referralData.points}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Points Earned
                        </p>
                      </div>
                    </div>
                    <div
                      className="text-xs px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: "rgba(34,211,238,0.1)",
                        color: "var(--app-text-muted)",
                      }}
                    >
                      Referred by{" "}
                      <span
                        className="font-semibold"
                        style={{ color: "var(--app-accent)" }}
                      >
                        @creator_vibes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard
                            .writeText(referralCode)
                            .catch(() => {});
                          setReferralCopied(true);
                          setTimeout(() => setReferralCopied(false), 2000);
                          toast.success("Referral code copied!");
                        }}
                        data-ocid="profile.referral.button"
                      >
                        {referralCopied ? "✓ Copied!" : "📋 Copy Code"}
                      </Button>
                      <Button
                        className="flex-1 text-white"
                        style={{
                          background:
                            "linear-gradient(135deg, #7c3aed, #f97316)",
                        }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator
                              .share({
                                title: "Join Connectly",
                                text: `Join me on Connectly! Use my code: ${referralCode}`,
                                url: window.location.href,
                              })
                              .catch(() => {});
                          } else {
                            navigator.clipboard
                              .writeText(
                                `Join me on Connectly! Use code: ${referralCode}`,
                              )
                              .catch(() => {});
                            toast.success("Share text copied!");
                          }
                        }}
                        data-ocid="profile.referral.secondary_button"
                      >
                        📤 Share
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Followers Modal */}
              <Dialog
                open={showFollowersModal}
                onOpenChange={setShowFollowersModal}
              >
                <DialogContent
                  className="max-w-sm max-h-[85vh] flex flex-col"
                  data-ocid="profile.followers.dialog"
                >
                  <DialogHeader>
                    <DialogTitle>Followers</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-1">
                    <input
                      type="text"
                      placeholder="Search followers..."
                      value={followersSearch}
                      onChange={(e) => setFollowersSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-8 text-sm rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30"
                      style={{ color: "var(--app-text)" }}
                    />
                    <svg
                      aria-label="Search"
                      role="img"
                      className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Search</title>
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scroll-smooth pb-2 scrollbar-thin">
                    {USERS.slice(0, 6)
                      .filter(
                        (u) =>
                          !blockedUsers.has(u.id) &&
                          (followersSearch === "" ||
                            u.name
                              .toLowerCase()
                              .includes(followersSearch.toLowerCase()) ||
                            u.username
                              .toLowerCase()
                              .includes(followersSearch.toLowerCase())),
                      )
                      .map((u) => (
                        <div key={u.id} className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: "var(--app-text)" }}
                            >
                              {u.name}
                            </p>
                            <p
                              className="text-xs truncate"
                              style={{ color: "var(--app-text-muted)" }}
                            >
                              @{u.username}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={
                              followedUsers.has(u.id) ? "outline" : "default"
                            }
                            className="text-xs h-7 px-3"
                            onClick={() => onToggleFollow(u.id)}
                            data-ocid="profile.followers.toggle"
                          >
                            {followedUsers.has(u.id) ? "Following" : "Follow"}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-muted"
                                data-ocid="profile.followers.dropdown_menu"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => {
                                  setBlockedUsers(
                                    (prev) => new Set([...prev, u.id]),
                                  );
                                  toast.error(
                                    `@${u.username} को block कर दिया गया`,
                                  );
                                }}
                              >
                                🚫 Block
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  toast(`@${u.username} की रिपोर्ट भेज दी गई`, {
                                    description:
                                      "हमारी team 24 घंटे में review करेगी",
                                  });
                                }}
                              >
                                🚩 Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                  </div>
                </DialogContent>
              </Dialog>
              {/* Following Modal */}
              <Dialog
                open={showFollowingModal}
                onOpenChange={setShowFollowingModal}
              >
                <DialogContent
                  className="max-w-sm max-h-[85vh] flex flex-col"
                  data-ocid="profile.following.dialog"
                >
                  <DialogHeader>
                    <DialogTitle>Following</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-1">
                    <input
                      type="text"
                      placeholder="Search following..."
                      value={followingSearch}
                      onChange={(e) => setFollowingSearch(e.target.value)}
                      className="w-full px-3 py-2 pl-8 text-sm rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/30"
                      style={{ color: "var(--app-text)" }}
                    />
                    <svg
                      aria-label="Search"
                      role="img"
                      className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Search</title>
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scroll-smooth pb-2 scrollbar-thin">
                    {USERS.filter(
                      (u) =>
                        followedUsers.has(u.id) &&
                        (followingSearch === "" ||
                          u.name
                            .toLowerCase()
                            .includes(followingSearch.toLowerCase()) ||
                          u.username
                            .toLowerCase()
                            .includes(followingSearch.toLowerCase())),
                    ).length === 0 ? (
                      <p
                        className="text-sm text-center py-4"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        You are not following anyone yet.
                      </p>
                    ) : (
                      USERS.filter(
                        (u) =>
                          followedUsers.has(u.id) &&
                          !blockedUsers.has(u.id) &&
                          (followingSearch === "" ||
                            u.name
                              .toLowerCase()
                              .includes(followingSearch.toLowerCase()) ||
                            u.username
                              .toLowerCase()
                              .includes(followingSearch.toLowerCase())),
                      ).map((u) => (
                        <div key={u.id} className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-semibold truncate"
                              style={{ color: "var(--app-text)" }}
                            >
                              {u.name}
                            </p>
                            <p
                              className="text-xs truncate"
                              style={{ color: "var(--app-text-muted)" }}
                            >
                              @{u.username}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-3"
                            onClick={() => onToggleFollow(u.id)}
                            data-ocid="profile.following.toggle"
                          >
                            Unfollow
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="p-1 rounded hover:bg-muted"
                                data-ocid="profile.following.dropdown_menu"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive cursor-pointer"
                                onClick={() => {
                                  setBlockedUsers(
                                    (prev) => new Set([...prev, u.id]),
                                  );
                                  toast.error(
                                    `@${u.username} को block कर दिया गया`,
                                  );
                                }}
                              >
                                🚫 Block
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  toast(`@${u.username} की रिपोर्ट भेज दी गई`, {
                                    description:
                                      "हमारी team 24 घंटे में review करेगी",
                                  });
                                }}
                              >
                                🚩 Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--app-text)" }}
              >
                Private Account
              </p>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                Only approved followers can see your posts
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              data-ocid="profile.switch"
            />
          </div>

          {/* Blocked Accounts */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--app-text)" }}
              >
                Blocked Accounts
              </p>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                {blockedUsers.size} account{blockedUsers.size !== 1 ? "s" : ""}{" "}
                blocked
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 px-3"
              onClick={() => setShowBlockedModal(true)}
              data-ocid="profile.blocked.button"
            >
              Manage
            </Button>
          </div>

          {/* Blocked Accounts Dialog */}
          <Dialog open={showBlockedModal} onOpenChange={setShowBlockedModal}>
            <DialogContent
              className="max-w-sm"
              data-ocid="profile.blocked.dialog"
            >
              <DialogHeader>
                <DialogTitle>Blocked Accounts</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                {USERS.filter((u) => blockedUsers.has(u.id)).length === 0 ? (
                  <p
                    className="text-sm text-center py-4"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    कोई blocked account नहीं है।
                  </p>
                ) : (
                  USERS.filter((u) => blockedUsers.has(u.id)).map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--app-text)" }}
                        >
                          {u.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          @{u.username}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-3"
                        onClick={() => {
                          setBlockedUsers((prev) => {
                            const next = new Set(prev);
                            next.delete(u.id);
                            return next;
                          });
                          toast.success(`@${u.username} को unblock कर दिया`);
                        }}
                        data-ocid="profile.blocked.button"
                      >
                        Unblock
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Static Pages */}
        {staticPage === "about" && (
          <AboutPage onBack={() => setStaticPage(null)} />
        )}
        {staticPage === "privacy" && (
          <PrivacyPolicyPage onBack={() => setStaticPage(null)} />
        )}
        {staticPage === "terms" && (
          <TermsPage onBack={() => setStaticPage(null)} />
        )}
        {staticPage === "contact" && (
          <ContactPage onBack={() => setStaticPage(null)} />
        )}

        {/* Account Centre */}
        {!staticPage && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
          >
            <h2
              className="text-base font-bold mb-4"
              style={{ color: "var(--app-text)" }}
            >
              ⚙️ Account Centre
            </h2>

            {/* Password & Security */}
            {[
              {
                key: "passwordSecurity",
                label: "🔐 Password & Security",
                content: (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Change Password
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Login & Recovery
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setChangePassOpen(true)}
                        data-ocid="profile.password.button"
                      >
                        Change
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Two-Factor Authentication
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          {twoFAEnabled ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <Switch
                        checked={twoFAEnabled}
                        onCheckedChange={setTwoFAEnabled}
                        data-ocid="profile.twofa.switch"
                      />
                    </div>
                    {twoFAEnabled && (
                      <div className="ml-4 space-y-2">
                        <div
                          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: "var(--app-bg)",
                            color: "var(--app-text-muted)",
                          }}
                        >
                          <span>📱</span>
                          <span>Authenticator App (Active)</span>
                        </div>
                        <div
                          className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                          style={{
                            backgroundColor: "var(--app-bg)",
                            color: "var(--app-text-muted)",
                          }}
                        >
                          <span>💬</span>
                          <span>SMS Authentication (Setup)</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Verification Selfie
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          🕐 Verification Pending
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => toast.info("Feature coming soon")}
                        data-ocid="profile.selfie.button"
                      >
                        Upload
                      </Button>
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium mb-2"
                        style={{ color: "var(--app-text)" }}
                      >
                        Saved Logins
                      </p>
                      {[
                        {
                          device: "Chrome on Windows",
                          location: "Mumbai, IN",
                          time: "2 days ago",
                        },
                        {
                          device: "Safari on iPhone 15",
                          location: "Delhi, IN",
                          time: "5 days ago",
                        },
                        {
                          device: "Firefox on Mac",
                          location: "Bangalore, IN",
                          time: "1 week ago",
                        },
                      ].map((session) => (
                        <div
                          key={session.device}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          style={{ borderColor: "var(--app-border)" }}
                        >
                          <div>
                            <p
                              className="text-xs font-medium"
                              style={{ color: "var(--app-text)" }}
                            >
                              {session.device}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--app-text-muted)" }}
                            >
                              {session.location} · {session.time}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6 px-2"
                            onClick={() => toast.success("Device removed")}
                            data-ocid="profile.device.delete_button"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                key: "security",
                label: "🛡️ Security",
                content: (
                  <div className="space-y-3 mt-2">
                    <div>
                      <p
                        className="text-sm font-medium mb-2"
                        style={{ color: "var(--app-text)" }}
                      >
                        Where You're Logged In
                      </p>
                      {[
                        {
                          device: "Chrome · Windows 11",
                          loc: "Mumbai, India",
                          time: "Active now",
                        },
                        {
                          device: "Safari · iPhone 15 Pro",
                          loc: "Delhi, India",
                          time: "3 hours ago",
                        },
                        {
                          device: "Firefox · macOS Sonoma",
                          loc: "Pune, India",
                          time: "Yesterday",
                        },
                      ].map((s) => (
                        <div
                          key={s.device}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                          style={{ borderColor: "var(--app-border)" }}
                        >
                          <div>
                            <p
                              className="text-xs font-medium"
                              style={{ color: "var(--app-text)" }}
                            >
                              {s.device}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--app-text-muted)" }}
                            >
                              {s.loc} · {s.time}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-6 px-2"
                            onClick={() => toast.success("Session ended")}
                            data-ocid="profile.session.delete_button"
                          >
                            Log Out
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Recent Email & Mobile
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          📧 c***@gmail.com · 📱 +91 ****5678
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => toast.info("Update via Edit Profile")}
                        data-ocid="profile.email.button"
                      >
                        Update
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Security Checkup
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Review your security status
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setShowSecurityCheckup(true)}
                        data-ocid="profile.security.button"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                key: "connectedExperience",
                label: "🔗 Connected Experience",
                content: (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--app-text)" }}
                      >
                        Add Account
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          toast.info("Multi-account support coming soon")
                        }
                        data-ocid="profile.addaccount.button"
                      >
                        + Add
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Sharing Across Profiles
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Share content across connected accounts
                        </p>
                      </div>
                      <Switch
                        checked={sharingAcrossProfile}
                        onCheckedChange={setSharingAcrossProfile}
                        data-ocid="profile.sharing.switch"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Memories of Connectly
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          On This Day memories
                        </p>
                      </div>
                      <Switch
                        checked={memoriesEnabled}
                        onCheckedChange={setMemoriesEnabled}
                        data-ocid="profile.memories.switch"
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: "profileInfoAccess",
                label: "👤 Profile Information & Access",
                content: (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Syncing Profile Picture
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Sync across connected accounts
                        </p>
                      </div>
                      <Switch
                        checked={syncProfilePic}
                        onCheckedChange={setSyncProfilePic}
                        data-ocid="profile.sync.switch"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Managing Avatar
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Customize your avatar
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => setShowAvatarPicker(true)}
                        data-ocid="profile.avatar.button"
                      >
                        Customize
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Show Profile Link
                        </p>
                        {showProfileLink && (
                          <p className="text-xs" style={{ color: "#60a5fa" }}>
                            connectly.app/@{profile.username}
                          </p>
                        )}
                      </div>
                      <Switch
                        checked={showProfileLink}
                        onCheckedChange={setShowProfileLink}
                        data-ocid="profile.profilelink.switch"
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: "infoPermissions",
                label: "📋 Your Information & Permissions",
                content: (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Download Your Data
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Request a copy of your data
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() =>
                          toast.success(
                            "Request submitted! We'll email you within 48 hours.",
                          )
                        }
                        data-ocid="profile.download.button"
                      >
                        Request
                      </Button>
                    </div>
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--app-text)" }}
                      >
                        Data Portability
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        Your data is stored locally in your browser. You can
                        export it at any time using the Download option above.
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: "subscription",
                label: "⭐ Subscription",
                content: (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--app-text)" }}
                      >
                        Current Plan:
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          backgroundColor: "rgba(34,211,238,0.15)",
                          color: "#22d3ee",
                        }}
                      >
                        Free
                      </span>
                    </div>
                    <Button
                      className="w-full font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #f97316)",
                      }}
                      onClick={() => setShowUpgradePro(true)}
                      data-ocid="profile.upgrade.button"
                    >
                      ✨ Upgrade to Connectly Pro
                    </Button>
                  </div>
                ),
              },
              {
                key: "manageAccount",
                label: "🗑️ Manage Account",
                content: (
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          Deactivate Account
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Temporarily disable your account
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-yellow-500 border-yellow-500"
                        onClick={() => setShowDeactivateModal(true)}
                        data-ocid="profile.deactivate.button"
                      >
                        Deactivate
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Delete Account
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          Permanently delete your account
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs text-destructive border-destructive"
                        onClick={() => setShowDeleteModal(true)}
                        data-ocid="profile.delete_button"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ),
              },
              {
                key: "aboutLegal",
                label: "ℹ️ About & Legal",
                content: (
                  <div className="space-y-2 mt-2">
                    {[
                      {
                        label: "About Connectly",
                        key: "about" as const,
                        onClick: () => setStaticPage("about"),
                      },
                      {
                        label: "🔒 Privacy Policy",
                        key: "privacy" as const,
                        onClick: () => setShowPrivacyModal(true),
                      },
                      {
                        label: "📋 Terms & Conditions",
                        key: "terms" as const,
                        onClick: () => setShowTermsModal(true),
                      },
                      {
                        label: "Contact & Support",
                        key: "contact" as const,
                        onClick: () => setStaticPage("contact"),
                      },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.key}
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"
                        style={{ color: "var(--app-text)" }}
                        data-ocid="profile.legal.button"
                      >
                        <span>{item.label}</span>
                        <span style={{ color: "var(--app-text-muted)" }}>
                          ›
                        </span>
                      </button>
                    ))}
                  </div>
                ),
              },
            ].map((section) => (
              <div
                key={section.key}
                className="border-b last:border-0"
                style={{ borderColor: "var(--app-border)" }}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between py-3 text-sm font-semibold"
                  style={{ color: "var(--app-text)" }}
                  onClick={() =>
                    setAcSection(acSection === section.key ? null : section.key)
                  }
                  data-ocid="profile.settings.toggle"
                >
                  <span>{section.label}</span>
                  <span
                    className="text-lg transition-transform duration-150"
                    style={{
                      transform:
                        acSection === section.key
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                    }}
                  >
                    ›
                  </span>
                </button>
                {acSection === section.key && section.content}
              </div>
            ))}

            {/* Modals for Account Centre */}
            {/* Change Password Modal */}
            <Dialog open={changePassOpen} onOpenChange={setChangePassOpen}>
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.password.modal"
              >
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background outline-none"
                    data-ocid="profile.password.input"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background outline-none"
                    data-ocid="profile.password.input"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background outline-none"
                    data-ocid="profile.password.input"
                  />
                  <Button
                    className="w-full"
                    onClick={() => {
                      setChangePassOpen(false);
                      toast.success("Password changed successfully!");
                    }}
                    data-ocid="profile.password.save_button"
                  >
                    Save Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Security Checkup Modal */}
            <Dialog
              open={showSecurityCheckup}
              onOpenChange={setShowSecurityCheckup}
            >
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.security.modal"
              >
                <DialogHeader>
                  <DialogTitle>🛡️ Security Checkup</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {[
                    {
                      label: "Password",
                      status: true,
                      note: "Strong password set",
                    },
                    {
                      label: "Two-Factor Authentication",
                      status: twoFAEnabled,
                      note: twoFAEnabled ? "Enabled" : "Not enabled",
                    },
                    {
                      label: "Recovery Email",
                      status: true,
                      note: "c***@gmail.com",
                    },
                    {
                      label: "Verification Selfie",
                      status: false,
                      note: "Not completed",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 py-2 border-b last:border-0"
                      style={{ borderColor: "var(--app-border)" }}
                    >
                      <span className="text-lg">
                        {item.status ? "✅" : "⭕"}
                      </span>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "var(--app-text)" }}
                        >
                          {item.label}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setShowSecurityCheckup(false)}
                    data-ocid="profile.security.close_button"
                  >
                    Done
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Avatar Picker Modal */}
            <Dialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.avatar.modal"
              >
                <DialogHeader>
                  <DialogTitle>Choose Avatar</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-4 gap-3 py-2">
                  {[
                    "😀",
                    "😎",
                    "🤓",
                    "👩‍💻",
                    "👨‍🎨",
                    "🦸",
                    "🧙",
                    "🤖",
                    "👑",
                    "🐱",
                    "🦊",
                    "🌟",
                  ].map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => {
                        setShowAvatarPicker(false);
                        toast.success(`Avatar set to ${emoji}`);
                      }}
                      className="text-3xl h-14 rounded-xl border-2 border-border hover:border-primary hover:scale-110 transition-all"
                      data-ocid="profile.avatar.button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Upgrade Pro Modal */}
            <Dialog open={showUpgradePro} onOpenChange={setShowUpgradePro}>
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.upgrade.modal"
              >
                <DialogHeader>
                  <DialogTitle>✨ Connectly Pro</DialogTitle>
                  <DialogDescription>Unlock premium features</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {[
                    "No ads experience",
                    "✅ Verified badge",
                    "📦 Extra storage (10GB)",
                    "🎨 Exclusive themes",
                    "⚡ Priority AI Studio",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--app-text)" }}
                    >
                      <span>⭐</span>
                      {f}
                    </div>
                  ))}
                  <Button
                    className="w-full font-bold text-white mt-2"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #f97316)",
                    }}
                    onClick={() => {
                      setShowUpgradePro(false);
                      toast.info("Pro plan coming soon! Stay tuned.");
                    }}
                    data-ocid="profile.upgrade.confirm_button"
                  >
                    Coming Soon — Stay Tuned
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Deactivate Modal */}
            <Dialog
              open={showDeactivateModal}
              onOpenChange={setShowDeactivateModal}
            >
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.deactivate.modal"
              >
                <DialogHeader>
                  <DialogTitle>Deactivate Account</DialogTitle>
                  <DialogDescription>
                    Your account will be temporarily disabled. You can
                    reactivate anytime.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowDeactivateModal(false)}
                    data-ocid="profile.deactivate.cancel_button"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={() => {
                      setShowDeactivateModal(false);
                      toast.success("Account deactivated (mock).");
                    }}
                    data-ocid="profile.deactivate.confirm_button"
                  >
                    Deactivate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Privacy Policy Modal */}
            <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
              <DialogContent
                className="max-w-lg max-h-[80vh] overflow-y-auto"
                data-ocid="profile.privacy.modal"
              >
                <DialogHeader>
                  <DialogTitle>🔒 Privacy Policy</DialogTitle>
                  <DialogDescription
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Last updated: January 2025
                  </DialogDescription>
                </DialogHeader>
                <div
                  className="space-y-4 text-sm mt-2"
                  style={{ color: "var(--app-text)" }}
                >
                  {[
                    {
                      title: "1. Information We Collect",
                      body: "We collect information you provide (name, email, profile photo, posts), usage data (interactions, watch time), and device info (OS, browser type).",
                    },
                    {
                      title: "2. How We Use Your Information",
                      body: "To personalize your feed and recommendations, improve app features, send notifications (with your permission), and ensure safety and moderation.",
                    },
                    {
                      title: "3. Data Storage & Security",
                      body: "Your data is stored securely on encrypted servers. We use HTTPS for all connections. We do not sell your personal data to third parties.",
                    },
                    {
                      title: "4. User-Generated Content",
                      body: "You own your content. By posting, you grant Connectly a license to display it within the app. You can delete your content and account at any time.",
                    },
                    {
                      title: "5. AI Features",
                      body: "AI-generated suggestions (captions, comments, hashtags) are for assistance only. AI content may be inaccurate — always review before publishing.",
                    },
                    {
                      title: "6. Third-Party Services",
                      body: "We may use analytics and cloud services. These providers have their own privacy policies.",
                    },
                    {
                      title: "7. Children's Privacy",
                      body: "Connectly is for users 13 and older. We do not knowingly collect data from children under 13.",
                    },
                    {
                      title: "8. Your Rights",
                      body: "You can access, correct, or delete your data anytime from Settings → Manage Account. You can also request data export.",
                    },
                    {
                      title: "9. Contact Us",
                      body: "For privacy questions: privacy@connectly.app",
                    },
                  ].map((section) => (
                    <div key={section.title}>
                      <p className="font-semibold mb-1">{section.title}</p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        {section.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-4 pt-3 border-t"
                  style={{ borderColor: "var(--app-border)" }}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowPrivacyModal(false)}
                    data-ocid="profile.privacy.close_button"
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Terms & Conditions Modal */}
            <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
              <DialogContent
                className="max-w-lg max-h-[80vh] overflow-y-auto"
                data-ocid="profile.terms.modal"
              >
                <DialogHeader>
                  <DialogTitle>📋 Terms &amp; Conditions</DialogTitle>
                  <DialogDescription
                    className="text-xs"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Last updated: January 2025
                  </DialogDescription>
                </DialogHeader>
                <div
                  className="space-y-4 text-sm mt-2"
                  style={{ color: "var(--app-text)" }}
                >
                  {[
                    {
                      title: "1. Acceptance",
                      body: "By using Connectly, you agree to these Terms. If you disagree, please do not use the app.",
                    },
                    {
                      title: "2. Eligibility",
                      body: "You must be at least 13 years old to use Connectly. By registering, you confirm you meet this requirement.",
                    },
                    {
                      title: "3. User Conduct",
                      body: "You agree NOT to post: hate speech, nudity, violence, harassment, spam, illegal content, or content that violates others' rights. Violations may result in account suspension or termination.",
                    },
                    {
                      title: "4. Intellectual Property",
                      body: "Connectly's branding, logo, and design are original and protected. You may not copy, reproduce, or distribute them.",
                    },
                    {
                      title: "5. User Content",
                      body: "You retain ownership of your posts. You grant Connectly a non-exclusive license to display your content within the platform. You are responsible for content you post.",
                    },
                    {
                      title: "6. AI Features Disclaimer",
                      body: "AI tools are provided as-is. AI-generated content may be inaccurate. Connectly is not liable for AI suggestions used publicly.",
                    },
                    {
                      title: "7. Subscription",
                      body: "Connectly+ is $5/month. Subscriptions auto-renew unless cancelled. Refunds are handled case-by-case — contact support@connectly.app.",
                    },
                    {
                      title: "8. Limitation of Liability",
                      body: "Connectly is not liable for indirect or incidental damages arising from app use.",
                    },
                    {
                      title: "9. Changes to Terms",
                      body: "We may update these terms. Continued use after changes constitutes acceptance.",
                    },
                    {
                      title: "10. Contact",
                      body: "For legal inquiries: legal@connectly.app",
                    },
                  ].map((section) => (
                    <div key={section.title}>
                      <p className="font-semibold mb-1">{section.title}</p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        {section.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-4 pt-3 border-t"
                  style={{ borderColor: "var(--app-border)" }}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowTermsModal(false)}
                    data-ocid="profile.terms.close_button"
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.delete.modal"
              >
                <DialogHeader>
                  <DialogTitle className="text-destructive">
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action is permanent and cannot be undone. All your data
                    will be deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <label
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    style={{ color: "var(--app-text)" }}
                  >
                    <input
                      type="checkbox"
                      checked={deleteConfirmed}
                      onChange={(e) => setDeleteConfirmed(e.target.checked)}
                      data-ocid="profile.delete.checkbox"
                    />
                    I understand this will permanently delete my account
                  </label>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmed(false);
                      }}
                      data-ocid="profile.delete.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      disabled={!deleteConfirmed}
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmed(false);
                        toast.error(
                          "Account deleted (mock). In production, this would be permanent.",
                        );
                      }}
                      data-ocid="profile.delete.confirm_button"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Tabs: Posts / Saved */}
        <div>
          <div
            className="flex border-b mb-3"
            style={{ borderColor: "var(--app-border)" }}
          >
            {(["posts", "saved", "tagged"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setProfileActiveTab(tab)}
                className="flex-1 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color:
                    profileActiveTab === tab
                      ? "var(--app-accent)"
                      : "var(--app-text-muted)",
                  borderBottom:
                    profileActiveTab === tab
                      ? "2px solid var(--app-accent)"
                      : "2px solid transparent",
                }}
                data-ocid={`profile.${tab}.tab`}
              >
                {tab === "posts"
                  ? "📷 Posts"
                  : tab === "saved"
                    ? "🔖 Saved"
                    : "🏷️ Tagged"}
              </button>
            ))}
          </div>

          {profileActiveTab === "posts" ? (
            <div className="grid grid-cols-3 gap-1" data-ocid="profile.list">
              {profilePosts.map((post, i) => (
                <button
                  type="button"
                  key={post.id}
                  className="relative aspect-square overflow-hidden rounded-lg group"
                  data-ocid={`profile.item.${i + 1}`}
                  onClick={() => setSelectedProfilePost(post)}
                >
                  <img
                    src={post.image}
                    alt="post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                  />
                  {post.caption && (
                    <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <p className="text-white text-[10px] leading-tight line-clamp-2 text-left">
                        {post.caption}
                      </p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : profileActiveTab === "saved" ? (
            <div className="flex flex-col gap-3">
              {/* Sub-tabs: Posts / Reels */}
              <div
                className="flex rounded-lg overflow-hidden border border-border"
                style={{ backgroundColor: "var(--app-card)" }}
              >
                <button
                  type="button"
                  onClick={() => setSavedSubTab("posts")}
                  className="flex-1 py-2 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      savedSubTab === "posts"
                        ? "var(--app-accent)"
                        : "transparent",
                    color:
                      savedSubTab === "posts"
                        ? "white"
                        : "var(--app-text-muted)",
                  }}
                  data-ocid="profile.saved.posts.tab"
                >
                  🖼️ Saved Posts
                </button>
                <button
                  type="button"
                  onClick={() => setSavedSubTab("reels")}
                  className="flex-1 py-2 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor:
                      savedSubTab === "reels"
                        ? "var(--app-accent)"
                        : "transparent",
                    color:
                      savedSubTab === "reels"
                        ? "white"
                        : "var(--app-text-muted)",
                  }}
                  data-ocid="profile.saved.reels.tab"
                >
                  🎬 Saved Reels
                </button>
              </div>

              {savedSubTab === "posts"
                ? (() => {
                    const allSavedPosts = posts.filter((p) => p.isBookmarked);
                    const savedPostsList = allSavedPosts.filter((p) => {
                      const matchesSearch =
                        savedPostsSearch === "" ||
                        p.caption
                          ?.toLowerCase()
                          .includes(savedPostsSearch.toLowerCase()) ||
                        p.location
                          ?.toLowerCase()
                          .includes(savedPostsSearch.toLowerCase());
                      const matchesFilter =
                        savedPostsFilter === "all" ||
                        (savedPostsFilter === "captioned" && p.caption) ||
                        (savedPostsFilter === "location" && p.location) ||
                        (savedPostsFilter === "mood" && p.mood);
                      return matchesSearch && matchesFilter;
                    });
                    return (
                      <div>
                        {allSavedPosts.length > 0 && (
                          <div className="px-2 pb-3 space-y-2">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Caption या location search करें..."
                                value={savedPostsSearch}
                                onChange={(e) =>
                                  setSavedPostsSearch(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl outline-none"
                                style={{
                                  background: "var(--app-card)",
                                  color: "var(--app-text)",
                                  border: "1px solid var(--app-border)",
                                }}
                              />
                              <svg
                                aria-hidden="true"
                                className="absolute left-2.5 top-2.5 w-3.5 h-3.5 opacity-40"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <title>Search</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                              {(
                                [
                                  "all",
                                  "captioned",
                                  "location",
                                  "mood",
                                ] as const
                              ).map((f) => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => setSavedPostsFilter(f)}
                                  className="flex-shrink-0 px-3 py-1 text-xs rounded-full transition-colors"
                                  style={{
                                    background:
                                      savedPostsFilter === f
                                        ? "var(--app-accent)"
                                        : "var(--app-card)",
                                    color:
                                      savedPostsFilter === f
                                        ? "white"
                                        : "var(--app-text-muted)",
                                    border: "1px solid var(--app-border)",
                                  }}
                                >
                                  {f === "all"
                                    ? "सभी"
                                    : f === "captioned"
                                      ? "📝 Caption"
                                      : f === "location"
                                        ? "📍 Location"
                                        : "😊 Mood"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {savedPostsList.length === 0 ? (
                          <div
                            className="flex flex-col items-center justify-center py-16 gap-3"
                            style={{ color: "var(--app-text-muted)" }}
                            data-ocid="profile.saved.posts.empty_state"
                          >
                            <Bookmark className="w-12 h-12 opacity-30" />
                            <p className="text-sm">
                              {allSavedPosts.length === 0
                                ? "कोई saved post नहीं"
                                : "कोई result नहीं"}
                            </p>
                            <p className="text-xs opacity-60">
                              {allSavedPosts.length === 0
                                ? "Posts में 🔖 tap करके save करें"
                                : "Search या filter बदलें"}
                            </p>
                          </div>
                        ) : (
                          <div
                            className="grid grid-cols-3 gap-1"
                            data-ocid="profile.saved.posts.list"
                          >
                            {savedPostsList.map((post, i) => (
                              <button
                                type="button"
                                key={post.id}
                                className="relative aspect-square overflow-hidden rounded-lg group"
                                data-ocid={`profile.saved.item.${i + 1}`}
                                onClick={() => setSelectedSavedPost(post)}
                              >
                                <img
                                  src={post.image}
                                  alt="saved post"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                                />
                                <div className="absolute top-1.5 right-1.5">
                                  <Bookmark className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                </div>
                                {post.caption && (
                                  <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    <p className="text-white text-[10px] leading-tight line-clamp-2 text-left">
                                      {post.caption}
                                    </p>
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                : (() => {
                    const filteredSavedReels = savedReelsList.filter(
                      (r) =>
                        savedReelsSearch === "" ||
                        r.caption
                          ?.toLowerCase()
                          .includes(savedReelsSearch.toLowerCase()) ||
                        r.user?.username
                          ?.toLowerCase()
                          .includes(savedReelsSearch.toLowerCase()),
                    );
                    return (
                      <div>
                        {savedReelsList.length > 0 && (
                          <div className="px-2 pb-3">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Caption या username search करें..."
                                value={savedReelsSearch}
                                onChange={(e) =>
                                  setSavedReelsSearch(e.target.value)
                                }
                                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl outline-none"
                                style={{
                                  background: "var(--app-card)",
                                  color: "var(--app-text)",
                                  border: "1px solid var(--app-border)",
                                }}
                              />
                              <svg
                                aria-hidden="true"
                                className="absolute left-2.5 top-2.5 w-3.5 h-3.5 opacity-40"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <title>Search</title>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                        {savedReelsList.length === 0 ? (
                          <div
                            className="flex flex-col items-center justify-center py-16 gap-3"
                            style={{ color: "var(--app-text-muted)" }}
                            data-ocid="profile.saved.reels.empty_state"
                          >
                            <Bookmark className="w-12 h-12 opacity-30" />
                            <p className="text-sm">कोई saved reel नहीं</p>
                            <p className="text-xs opacity-60">
                              Reels में 🔖 tap करके save करें
                            </p>
                          </div>
                        ) : filteredSavedReels.length === 0 ? (
                          <div
                            className="flex flex-col items-center justify-center py-16 gap-3"
                            style={{ color: "var(--app-text-muted)" }}
                          >
                            <Bookmark className="w-12 h-12 opacity-30" />
                            <p className="text-sm">कोई result नहीं</p>
                            <p className="text-xs opacity-60">Search बदलें</p>
                          </div>
                        ) : (
                          <div
                            className="grid grid-cols-3 gap-1"
                            data-ocid="profile.saved.reels.list"
                          >
                            {filteredSavedReels.map((reel, i) => (
                              <div
                                key={reel.id}
                                className="relative aspect-square overflow-hidden rounded-lg group bg-black cursor-pointer"
                                data-ocid={`profile.saved.reel.item.${i + 1}`}
                              >
                                <button
                                  type="button"
                                  className="absolute inset-0 z-10 w-full h-full opacity-0"
                                  aria-label="View reel"
                                  onClick={() => setSelectedSavedReel(reel)}
                                />
                                {reel.videoUrl ? (
                                  <video
                                    src={reel.videoUrl}
                                    className="w-full h-full object-cover opacity-80"
                                    muted
                                    playsInline
                                  />
                                ) : (
                                  <img
                                    src={reel.image}
                                    alt={reel.caption}
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-150"
                                  />
                                )}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <Play className="w-8 h-8 text-white fill-white" />
                                </div>
                                <div className="absolute top-1.5 right-1.5">
                                  <Bookmark className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 px-1.5 pb-1.5 pt-4 bg-gradient-to-t from-black/60 to-transparent">
                                  <p className="text-white text-[10px] leading-tight line-clamp-1">
                                    {reel.caption}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
            </div>
          ) : (
            <div
              className="grid grid-cols-3 gap-1"
              data-ocid="profile.tagged.list"
            >
              {Array.from({ length: 6 }, (_, i) => ({
                id: i + 1,
                image: `https://picsum.photos/seed/tagged${i + 1}/300/300`,
              })).map((post, i) => (
                <button
                  type="button"
                  key={post.id}
                  className="relative aspect-square overflow-hidden rounded-lg group"
                  data-ocid={`profile.tagged.item.${i + 1}`}
                  onClick={() => setSelectedTaggedPost(post)}
                >
                  <img
                    src={post.image}
                    alt="tagged post"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-black/50 rounded-full p-0.5">
                    <span className="text-[10px]">🏷️</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedProfilePost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            data-ocid="profile.post.modal"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => setSelectedProfilePost(null)}
            />
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">
                    {profile.username}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedProfilePost(null)}
                  data-ocid="profile.post.close_button"
                >
                  ✕
                </button>
              </div>
              <img
                src={selectedProfilePost.image}
                alt="post"
                className="w-full aspect-square object-cover"
              />
              {(selectedProfilePost.caption ||
                selectedProfilePost.location ||
                selectedProfilePost.mood) && (
                <div className="px-4 py-2 border-b border-border">
                  {selectedProfilePost.caption && (
                    <p className="text-sm" style={{ color: "var(--app-text)" }}>
                      <span className="font-semibold mr-1">
                        {profile.username}
                      </span>
                      {selectedProfilePost.caption}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProfilePost.location && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        📍 {selectedProfilePost.location}
                      </span>
                    )}
                    {selectedProfilePost.mood && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--app-text-muted)" }}
                      >
                        {selectedProfilePost.mood}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${profilePostLiked.has(selectedProfilePost.id) ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() =>
                    setProfilePostLiked((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedProfilePost.id))
                        next.delete(selectedProfilePost.id);
                      else next.add(selectedProfilePost.id);
                      return next;
                    })
                  }
                  data-ocid="profile.post.like"
                >
                  <span>
                    {profilePostLiked.has(selectedProfilePost.id) ? "❤️" : "🤍"}
                  </span>
                  <span>
                    {profilePostLiked.has(selectedProfilePost.id) ? 121 : 120}{" "}
                    likes
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() =>
                    document
                      .getElementById("profile-post-comment-input")
                      ?.focus()
                  }
                  data-ocid="profile.post.comment"
                >
                  <span>💬</span>
                  <span>
                    {(profilePostComments[selectedProfilePost.id]?.length ??
                      0) + 3}{" "}
                    comments
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  onClick={() => setShowOwnProfileShareModal(true)}
                  data-ocid="profile.post.share"
                >
                  <span>📤</span>
                </button>
              </div>
              <div className="px-4 py-2 max-h-48 overflow-y-auto space-y-2">
                {[
                  {
                    id: -1,
                    text: "Beautiful! ✨",
                    username: "priya_k",
                    replies: [],
                  },
                  { id: -2, text: "🔥🔥", username: "rahul_dev", replies: [] },
                  {
                    id: -3,
                    text: "Love this vibe 😍",
                    username: "neha_s",
                    replies: [],
                  },
                  ...(profilePostComments[selectedProfilePost.id] || []),
                ].map((c) => (
                  <div key={c.id} className="flex flex-col gap-0.5">
                    <div className="flex gap-1 items-start flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {c.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (profilePostReplyingTo === c.id) {
                            setProfilePostReplyingTo(null);
                          } else {
                            setProfilePostReplyingTo(c.id);
                            setProfilePostReplyInputs((prev) => ({
                              ...prev,
                              [c.id]: `@${c.username} `,
                            }));
                          }
                        }}
                        className="text-[10px] font-medium text-muted-foreground leading-none"
                      >
                        {profilePostReplyingTo === c.id ? "Cancel" : "Reply"}
                      </button>
                      {c.replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setProfilePostExpandedReplies((prev) => ({
                              ...prev,
                              [c.id]: !prev[c.id],
                            }))
                          }
                          className="text-[10px] font-medium text-primary leading-none"
                        >
                          {profilePostExpandedReplies[c.id]
                            ? "Hide replies"
                            : `View ${c.replies.length} ${c.replies.length === 1 ? "reply" : "replies"}`}
                        </button>
                      )}
                    </div>
                    {profilePostExpandedReplies[c.id] &&
                      c.replies.length > 0 && (
                        <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-border pl-3">
                          {c.replies.map((r) => (
                            <div key={r.id} className="flex flex-col gap-0.5">
                              <div className="flex gap-1 items-start flex-wrap">
                                <span className="text-xs font-semibold text-foreground">
                                  {r.username}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {r.text}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setProfilePostReplyingTo(c.id);
                                  setProfilePostReplyInputs((prev) => ({
                                    ...prev,
                                    [c.id]: `@${r.username} `,
                                  }));
                                }}
                                className="text-[10px] font-medium text-muted-foreground leading-none self-start"
                              >
                                Reply
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    {profilePostReplyingTo === c.id && (
                      <div className="ml-4 mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={profilePostReplyInputs[c.id] ?? ""}
                          onChange={(e) =>
                            setProfilePostReplyInputs((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const text = profilePostReplyInputs[c.id]?.trim();
                              if (text && selectedProfilePost) {
                                setProfilePostComments((prev) => {
                                  const list =
                                    prev[selectedProfilePost.id] || [];
                                  return {
                                    ...prev,
                                    [selectedProfilePost.id]: list.map((cm) =>
                                      cm.id === c.id
                                        ? {
                                            ...cm,
                                            replies: [
                                              ...cm.replies,
                                              {
                                                id: Date.now(),
                                                text,
                                                username: profile.username,
                                              },
                                            ],
                                          }
                                        : cm,
                                    ),
                                  };
                                });
                                setProfilePostReplyInputs((prev) => ({
                                  ...prev,
                                  [c.id]: "",
                                }));
                                setProfilePostReplyingTo(null);
                                setProfilePostExpandedReplies((prev) => ({
                                  ...prev,
                                  [c.id]: true,
                                }));
                              }
                            }
                          }}
                          placeholder={`Reply to @${c.username}...`}
                          className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                        />
                        <button
                          type="button"
                          className="text-xs font-semibold text-primary disabled:opacity-40"
                          disabled={!profilePostReplyInputs[c.id]?.trim()}
                          onClick={() => {
                            const text = profilePostReplyInputs[c.id]?.trim();
                            if (text && selectedProfilePost) {
                              setProfilePostComments((prev) => {
                                const list = prev[selectedProfilePost.id] || [];
                                return {
                                  ...prev,
                                  [selectedProfilePost.id]: list.map((cm) =>
                                    cm.id === c.id
                                      ? {
                                          ...cm,
                                          replies: [
                                            ...cm.replies,
                                            {
                                              id: Date.now(),
                                              text,
                                              username: profile.username,
                                            },
                                          ],
                                        }
                                      : cm,
                                  ),
                                };
                              });
                              setProfilePostReplyInputs((prev) => ({
                                ...prev,
                                [c.id]: "",
                              }));
                              setProfilePostReplyingTo(null);
                              setProfilePostExpandedReplies((prev) => ({
                                ...prev,
                                [c.id]: true,
                              }));
                            }
                          }}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
                <input
                  id="profile-post-comment-input"
                  type="text"
                  placeholder="Add a comment..."
                  value={profilePostCommentInput}
                  onChange={(e) => setProfilePostCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      profilePostCommentInput.trim() &&
                      selectedProfilePost
                    ) {
                      setProfilePostComments((prev) => ({
                        ...prev,
                        [selectedProfilePost.id]: [
                          ...(prev[selectedProfilePost.id] || []),
                          {
                            id: Date.now(),
                            text: profilePostCommentInput.trim(),
                            username: profile.username,
                            replies: [],
                          },
                        ],
                      }));
                      setProfilePostCommentInput("");
                    }
                  }}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                  data-ocid="profile.post.input"
                />
                <button
                  type="button"
                  className="text-sm font-semibold text-primary disabled:opacity-40"
                  disabled={!profilePostCommentInput.trim()}
                  onClick={() => {
                    if (profilePostCommentInput.trim() && selectedProfilePost) {
                      setProfilePostComments((prev) => ({
                        ...prev,
                        [selectedProfilePost.id]: [
                          ...(prev[selectedProfilePost.id] || []),
                          {
                            id: Date.now(),
                            text: profilePostCommentInput.trim(),
                            username: profile.username,
                            replies: [],
                          },
                        ],
                      }));
                      setProfilePostCommentInput("");
                    }
                  }}
                  data-ocid="profile.post.send"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedSavedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            data-ocid="profile.saved.post.modal"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => setSelectedSavedPost(null)}
            />
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="w-7 h-7">
                    <AvatarImage
                      src={selectedSavedPost.user.avatar}
                      alt={selectedSavedPost.user.name}
                    />
                    <AvatarFallback>
                      {selectedSavedPost.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-sm">
                    {selectedSavedPost.user.username}
                  </span>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedSavedPost(null)}
                  data-ocid="profile.saved.post.close_button"
                >
                  ✕
                </button>
              </div>
              <img
                src={selectedSavedPost.image}
                alt="saved post"
                className="w-full aspect-square object-cover"
              />
              {selectedSavedPost.caption && (
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm" style={{ color: "var(--app-text)" }}>
                    <span className="font-semibold mr-1">
                      {selectedSavedPost.user.username}
                    </span>
                    {selectedSavedPost.caption}
                  </p>
                  {(selectedSavedPost.location || selectedSavedPost.mood) && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedSavedPost.location && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          📍 {selectedSavedPost.location}
                        </span>
                      )}
                      {selectedSavedPost.mood && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--app-text-muted)" }}
                        >
                          {selectedSavedPost.mood}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center gap-4 px-4 py-3">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${savedPostLiked.has(selectedSavedPost.id) ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() =>
                    setSavedPostLiked((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedSavedPost.id))
                        next.delete(selectedSavedPost.id);
                      else next.add(selectedSavedPost.id);
                      return next;
                    })
                  }
                  data-ocid="profile.saved.post.like_button"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={
                      savedPostLiked.has(selectedSavedPost.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  {savedPostLiked.has(selectedSavedPost.id)
                    ? selectedSavedPost.likes + 1
                    : selectedSavedPost.likes}
                </button>
                <button
                  type="button"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${selectedSavedPost.isBookmarked ? "text-yellow-500" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() => onBookmark(selectedSavedPost.id)}
                  data-ocid="profile.saved.post.save_button"
                >
                  <Bookmark
                    className="w-4 h-4"
                    fill={
                      selectedSavedPost.isBookmarked ? "currentColor" : "none"
                    }
                  />
                  {selectedSavedPost.isBookmarked ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = selectedSavedPost.image;
                    link.download = "post.jpg";
                    link.click();
                  }}
                  data-ocid="profile.saved.post.download_button"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    setShowOwnProfileShareModal(true);
                    toast.success("Post shared!");
                  }}
                  data-ocid="profile.saved.post.secondary_button"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFollow(selectedSavedPost.user.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ml-auto"
                  style={{
                    background: followedUsers.has(selectedSavedPost.user.id)
                      ? "var(--app-card)"
                      : "linear-gradient(135deg, #7c3aed, #f97316)",
                    color: followedUsers.has(selectedSavedPost.user.id)
                      ? "var(--app-text-muted)"
                      : "white",
                    border: "1px solid var(--app-border)",
                  }}
                  data-ocid="profile.saved.post.toggle"
                >
                  {followedUsers.has(selectedSavedPost.user.id)
                    ? "Following"
                    : "Follow"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedTaggedPost && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            data-ocid="tagged.modal"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => setSelectedTaggedPost(null)}
            />
            <div
              className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl z-10"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">@_you</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTaggedAuthorFollowed((v) => !v);
                      toast.success(
                        taggedAuthorFollowed
                          ? "Unfollow किया"
                          : "Follow किया! 🎉",
                      );
                    }}
                    className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                    style={{
                      background: taggedAuthorFollowed
                        ? "transparent"
                        : "linear-gradient(135deg, #7c3aed, #f97316)",
                      color: taggedAuthorFollowed
                        ? "var(--app-text-muted)"
                        : "white",
                      border: "1px solid var(--app-border)",
                    }}
                    data-ocid="tagged.toggle"
                  >
                    {taggedAuthorFollowed ? "Following" : "Follow"}
                  </button>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSelectedTaggedPost(null)}
                  data-ocid="tagged.close_button"
                >
                  ✕
                </button>
              </div>
              {/* Image */}
              <img
                src={selectedTaggedPost.image}
                alt="tagged post"
                className="w-full aspect-square object-cover"
              />
              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
                <button
                  type="button"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${taggedLiked.has(selectedTaggedPost.id) ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
                  onClick={() =>
                    setTaggedLiked((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedTaggedPost.id))
                        next.delete(selectedTaggedPost.id);
                      else next.add(selectedTaggedPost.id);
                      return next;
                    })
                  }
                  data-ocid="tagged.checkbox"
                >
                  <span>
                    {taggedLiked.has(selectedTaggedPost.id) ? "❤️" : "🤍"}
                  </span>
                  <span>
                    {taggedLiked.has(selectedTaggedPost.id) ? 243 : 242} likes
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() =>
                    document.getElementById("tagged-comment-input")?.focus()
                  }
                  data-ocid="tagged.secondary_button"
                >
                  <span>💬</span>
                  <span>
                    {(taggedComments[selectedTaggedPost.id]?.length ?? 0) + 4}{" "}
                    comments
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                  }}
                  data-ocid="tagged.button"
                >
                  <span>📤</span>
                </button>
              </div>
              {/* Comments */}
              <div className="px-4 py-2 max-h-48 overflow-y-auto space-y-2">
                {[
                  {
                    id: -1,
                    text: "Great shot! 🔥",
                    username: "rahul_dev",
                    replies: [],
                  },
                  {
                    id: -2,
                    text: "Love this ✨",
                    username: "priya_k",
                    replies: [],
                  },
                  {
                    id: -3,
                    text: "Amazing vibes 😍",
                    username: "amit_photo",
                    replies: [],
                  },
                  {
                    id: -4,
                    text: "So good! 🙌",
                    username: "neha_s",
                    replies: [],
                  },
                  ...(taggedComments[selectedTaggedPost.id] || []),
                ].map((c) => (
                  <div key={c.id} className="flex flex-col gap-0.5">
                    <div className="flex gap-1 items-start flex-wrap">
                      <span className="text-xs font-semibold text-foreground">
                        {c.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {c.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (taggedReplyingTo === c.id) {
                            setTaggedReplyingTo(null);
                          } else {
                            setTaggedReplyingTo(c.id);
                            setTaggedReplyInputs((prev) => ({
                              ...prev,
                              [c.id]: `@${c.username} `,
                            }));
                          }
                        }}
                        className="text-[10px] font-medium text-muted-foreground leading-none"
                      >
                        {taggedReplyingTo === c.id ? "Cancel" : "Reply"}
                      </button>
                      {c.replies.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setTaggedExpandedReplies((prev) => ({
                              ...prev,
                              [c.id]: !prev[c.id],
                            }))
                          }
                          className="text-[10px] font-medium text-primary leading-none"
                        >
                          {taggedExpandedReplies[c.id]
                            ? "Hide replies"
                            : `View ${c.replies.length} ${c.replies.length === 1 ? "reply" : "replies"}`}
                        </button>
                      )}
                    </div>
                    {taggedExpandedReplies[c.id] && c.replies.length > 0 && (
                      <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-border pl-3">
                        {c.replies.map((r) => (
                          <div key={r.id} className="flex flex-col gap-0.5">
                            <div className="flex gap-1 items-start flex-wrap">
                              <span className="text-xs font-semibold text-foreground">
                                {r.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {r.text}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTaggedReplyingTo(c.id);
                                setTaggedReplyInputs((prev) => ({
                                  ...prev,
                                  [c.id]: `@${r.username} `,
                                }));
                              }}
                              className="text-[10px] font-medium text-muted-foreground leading-none self-start"
                            >
                              Reply
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {taggedReplyingTo === c.id && (
                      <div className="ml-4 mt-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={taggedReplyInputs[c.id] ?? ""}
                          onChange={(e) =>
                            setTaggedReplyInputs((prev) => ({
                              ...prev,
                              [c.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const text = taggedReplyInputs[c.id]?.trim();
                              if (text && selectedTaggedPost) {
                                setTaggedComments((prev) => {
                                  const list =
                                    prev[selectedTaggedPost.id] || [];
                                  return {
                                    ...prev,
                                    [selectedTaggedPost.id]: list.map((cm) =>
                                      cm.id === c.id
                                        ? {
                                            ...cm,
                                            replies: [
                                              ...cm.replies,
                                              {
                                                id: Date.now(),
                                                text,
                                                username: "you",
                                              },
                                            ],
                                          }
                                        : cm,
                                    ),
                                  };
                                });
                                setTaggedReplyInputs((prev) => ({
                                  ...prev,
                                  [c.id]: "",
                                }));
                                setTaggedReplyingTo(null);
                                setTaggedExpandedReplies((prev) => ({
                                  ...prev,
                                  [c.id]: true,
                                }));
                              }
                            }
                          }}
                          placeholder={`Reply to @${c.username}...`}
                          className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                        />
                        <button
                          type="button"
                          className="text-xs font-semibold text-primary disabled:opacity-40"
                          disabled={!taggedReplyInputs[c.id]?.trim()}
                          onClick={() => {
                            const text = taggedReplyInputs[c.id]?.trim();
                            if (text && selectedTaggedPost) {
                              setTaggedComments((prev) => {
                                const list = prev[selectedTaggedPost.id] || [];
                                return {
                                  ...prev,
                                  [selectedTaggedPost.id]: list.map((cm) =>
                                    cm.id === c.id
                                      ? {
                                          ...cm,
                                          replies: [
                                            ...cm.replies,
                                            {
                                              id: Date.now(),
                                              text,
                                              username: "you",
                                            },
                                          ],
                                        }
                                      : cm,
                                  ),
                                };
                              });
                              setTaggedReplyInputs((prev) => ({
                                ...prev,
                                [c.id]: "",
                              }));
                              setTaggedReplyingTo(null);
                              setTaggedExpandedReplies((prev) => ({
                                ...prev,
                                [c.id]: true,
                              }));
                            }
                          }}
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Comment input */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
                <input
                  id="tagged-comment-input"
                  type="text"
                  placeholder="Add a comment..."
                  value={taggedCommentInput}
                  onChange={(e) => setTaggedCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      taggedCommentInput.trim() &&
                      selectedTaggedPost
                    ) {
                      setTaggedComments((prev) => ({
                        ...prev,
                        [selectedTaggedPost.id]: [
                          ...(prev[selectedTaggedPost.id] || []),
                          {
                            id: Date.now(),
                            text: taggedCommentInput.trim(),
                            username: "you",
                            replies: [],
                          },
                        ],
                      }));
                      setTaggedCommentInput("");
                    }
                  }}
                  className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                  data-ocid="tagged.input"
                />
                <button
                  type="button"
                  className="text-sm font-semibold text-primary disabled:opacity-40"
                  disabled={!taggedCommentInput.trim()}
                  onClick={() => {
                    if (taggedCommentInput.trim() && selectedTaggedPost) {
                      setTaggedComments((prev) => ({
                        ...prev,
                        [selectedTaggedPost.id]: [
                          ...(prev[selectedTaggedPost.id] || []),
                          {
                            id: Date.now(),
                            text: taggedCommentInput.trim(),
                            username: "you",
                            replies: [],
                          },
                        ],
                      }));
                      setTaggedCommentInput("");
                    }
                  }}
                  data-ocid="tagged.submit_button"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {selectedSavedReel && (
        <div
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          data-ocid="profile.saved.reel.viewer"
        >
          <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setSelectedSavedReel(null)}
              className="text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="text-white font-semibold text-sm">Saved Reel</span>
            <div className="w-8" />
          </div>
          <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
            {selectedSavedReel.videoUrl ? (
              <video
                src={selectedSavedReel.videoUrl}
                className="w-full h-full object-contain max-h-[calc(100vh-160px)]"
                autoPlay
                loop
                playsInline
                controls
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                src={selectedSavedReel.image}
                alt={selectedSavedReel.caption}
                className="w-full h-full object-contain max-h-[calc(100vh-160px)]"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={selectedSavedReel.user.avatar}
                  alt={selectedSavedReel.user.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
                <span className="text-white font-semibold text-sm">
                  {selectedSavedReel.user.username}
                </span>
              </div>
              {selectedSavedReel.caption && (
                <p className="text-white/90 text-sm line-clamp-2">
                  {selectedSavedReel.caption}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-around px-4 py-3 bg-black/90 border-t border-white/10">
            <button
              type="button"
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${savedReelLiked.has(selectedSavedReel.id) ? "text-red-400" : "text-white/70"}`}
              onClick={() =>
                setSavedReelLiked((prev) => {
                  const next = new Set(prev);
                  if (next.has(selectedSavedReel.id))
                    next.delete(selectedSavedReel.id);
                  else next.add(selectedSavedReel.id);
                  return next;
                })
              }
            >
              <Heart
                className="w-6 h-6"
                fill={
                  savedReelLiked.has(selectedSavedReel.id)
                    ? "currentColor"
                    : "none"
                }
              />
              <span>
                {savedReelLiked.has(selectedSavedReel.id)
                  ? selectedSavedReel.likes + 1
                  : selectedSavedReel.likes}
              </span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs font-medium text-white/70"
              onClick={() => {
                const savedReelCommentInput = document.getElementById(
                  "saved-reel-comment-input",
                );
                savedReelCommentInput?.focus();
              }}
            >
              <MessageCircle className="w-6 h-6" />
              <span>{selectedSavedReel.comments}</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs font-medium text-yellow-400"
            >
              <Bookmark className="w-6 h-6 fill-yellow-400" />
              <span>Saved</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs font-medium text-white/70"
              onClick={() => {
                const a = document.createElement("a");
                a.href = selectedSavedReel.image;
                a.download = "reel.jpg";
                a.click();
                toast.success("⬇️ Reel downloaded!");
              }}
            >
              <Download className="w-6 h-6" />
              <span>Download</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-1 text-xs font-medium text-white/70"
              onClick={() => setSavedReelShareOpen(true)}
            >
              <Share2 className="w-6 h-6" />
              <span>Share</span>
            </button>
            <button
              type="button"
              className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${followedUsers.has(selectedSavedReel.user.id) ? "text-white/50" : "text-pink-400"}`}
              onClick={() => onToggleFollow(selectedSavedReel.user.id)}
            >
              <UserIcon className="w-6 h-6" />
              <span>
                {followedUsers.has(selectedSavedReel.user.id)
                  ? "Following"
                  : "Follow"}
              </span>
            </button>
          </div>
          {/* Comment input */}
          <div className="flex items-center gap-2 px-4 py-3 bg-black/95 border-t border-white/10">
            <input
              id="saved-reel-comment-input"
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-white/10 text-white text-sm rounded-full px-4 py-2 outline-none placeholder:text-white/40"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  toast.success("💬 Comment posted!");
                  e.currentTarget.value = "";
                }
              }}
            />
            <button
              type="button"
              className="text-pink-400 font-semibold text-sm"
              onClick={() => {
                const input = document.getElementById(
                  "saved-reel-comment-input",
                ) as HTMLInputElement;
                if (input?.value.trim()) {
                  toast.success("💬 Comment posted!");
                  input.value = "";
                }
              }}
            >
              Post
            </button>
          </div>
        </div>
      )}
      <GlobalShareSheet
        open={savedReelShareOpen}
        onClose={() => setSavedReelShareOpen(false)}
        title="Check out this reel on Connectly!"
        url={window.location.href}
      />
      <GlobalShareSheet
        open={showOwnProfileShareModal}
        onClose={() => setShowOwnProfileShareModal(false)}
        title="Check out my Connectly profile!"
        url={window.location.href}
      />
    </>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

function Sidebar({
  activePage,
  onNavigate,
  notifCount,
  onCreatePost,
}: {
  activePage: Page;
  onNavigate: (p: Page) => void;
  notifCount: number;
  onCreatePost: () => void;
}) {
  const navItems: NavItem[] = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "search", label: "Search", icon: <Search className="w-5 h-5" /> },
    { id: "reels", label: "Reels", icon: <Play className="w-5 h-5" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "chat",
      label: "Messages",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    { id: "profile", label: "Profile", icon: <UserIcon className="w-5 h-5" /> },
    { id: "ai", label: "AI Studio", icon: <Sparkles className="w-5 h-5" /> },
  ];

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen flex-col py-6 px-4 z-50"
      style={{
        width: 240,
        backgroundColor: "var(--app-panel)",
        borderRight: "1px solid var(--app-border)",
      }}
      data-ocid="nav.panel"
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <h1
          className="text-2xl font-extrabold"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Connectly
        </h1>
      </div>

      {/* Create Post button */}
      <button
        type="button"
        onClick={onCreatePost}
        className="mx-3 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
        data-ocid="create_post.open_modal_button"
      >
        <Plus className="w-4 h-4" />
        Create Post
      </button>

      {/* Nav items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
              style={{
                backgroundColor: isActive
                  ? "rgba(30,136,255,0.12)"
                  : "transparent",
                color: isActive ? "var(--app-accent)" : "var(--app-text-muted)",
              }}
              data-ocid={`nav.${item.id}.link`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.id === "notifications" && notifCount > 0 && (
                <span
                  className="ml-auto w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: "var(--app-badge)" }}
                >
                  {notifCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <button
        type="button"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium"
        style={{ color: "var(--app-text-muted)" }}
        data-ocid="nav.settings.link"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </button>
    </aside>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function BottomNav({
  activePage,
  onNavigate,
  notifCount,
  onCreatePost,
}: {
  activePage: Page;
  onNavigate: (p: Page) => void;
  notifCount: number;
  onCreatePost: () => void;
}) {
  const items = [
    { id: "home" as Page, icon: <Home className="w-6 h-6" /> },
    { id: "search" as Page, icon: <Search className="w-6 h-6" /> },
    { id: "notifications" as Page, icon: <Bell className="w-6 h-6" /> },
    { id: "profile" as Page, icon: <UserIcon className="w-6 h-6" /> },
    { id: "reels" as Page, icon: <Play className="w-6 h-6" /> },
    { id: "ai" as Page, icon: <Sparkles className="w-6 h-6" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 border-t border-border z-50"
      style={{ backgroundColor: "var(--app-nav)" }}
      data-ocid="nav.panel"
    >
      {items.slice(0, 3).map((item) => {
        const isActive = activePage === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 active:scale-95"
            style={{
              color: isActive ? "var(--app-accent)" : "var(--app-text-muted)",
            }}
            data-ocid={`nav.${item.id}.link`}
          >
            <span
              style={{
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.15s",
                display: "block",
              }}
            >
              {item.icon}
            </span>
            <span
              className="mt-0.5 h-1 rounded-full transition-all duration-150"
              style={{
                width: isActive ? 16 : 0,
                backgroundColor: "var(--app-accent)",
                opacity: isActive ? 1 : 0,
              }}
            />
            {item.id === "notifications" && notifCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--app-badge)" }}
              >
                {notifCount}
              </span>
            )}
          </button>
        );
      })}

      {/* Center Create button */}
      <button
        type="button"
        onClick={onCreatePost}
        className="flex items-center justify-center w-12 h-12 rounded-2xl text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
        data-ocid="create_post.open_modal_button"
      >
        <Plus className="w-6 h-6" />
      </button>

      {items.slice(3).map((item) => {
        const isActive = activePage === item.id;
        return (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-150 active:scale-95"
            style={{
              color: isActive ? "var(--app-accent)" : "var(--app-text-muted)",
            }}
            data-ocid={`nav.${item.id}.link`}
          >
            <span
              style={{
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 0.15s",
                display: "block",
              }}
            >
              {item.icon}
            </span>
            <span
              className="mt-0.5 h-1 rounded-full transition-all duration-150"
              style={{
                width: isActive ? 16 : 0,
                backgroundColor: "var(--app-accent)",
                opacity: isActive ? 1 : 0,
              }}
            />
            {item.id === "notifications" && notifCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold"
                style={{ backgroundColor: "var(--app-badge)" }}
              >
                {notifCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── RIGHT SIDEBAR ────────────────────────────────────────────────────────────

function RightSidebar({
  onNavigate,
  profile,
}: { onNavigate: (p: Page) => void; profile: ProfileState }) {
  return (
    <aside
      className="hidden lg:flex flex-col gap-4 pt-2"
      style={{ width: 280 }}
      data-ocid="suggestions.panel"
    >
      {/* Current user */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--app-text)" }}
            >
              {profile.username}
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              {profile.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-xs font-semibold"
          style={{ color: "var(--app-accent)" }}
          onClick={() => onNavigate("profile")}
          data-ocid="suggestions.link"
        >
          Switch
        </button>
      </div>

      {/* Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--app-text-muted)" }}
          >
            Suggestions For You
          </p>
          <button
            type="button"
            className="text-xs font-semibold"
            style={{ color: "var(--app-text)" }}
            data-ocid="suggestions.button"
          >
            See All
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {USERS.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between"
              data-ocid={`suggestions.item.${user.id}`}
            >
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--app-text)" }}
                  >
                    {user.username}
                  </p>
                  <p
                    className="text-[11px]"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    Suggested for you
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="text-xs font-semibold"
                style={{ color: "var(--app-accent)" }}
                data-ocid={`suggestions.item.${user.id}.button`}
              >
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p
        className="text-[11px] mt-4"
        style={{ color: "var(--app-text-muted)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Built with love using caffeine.ai
        </a>
      </p>
    </aside>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────

// ─── LOGIN SCREEN ─────────────────────────────────────────────────────────────

// ─── AI STUDIO PAGE ───────────────────────────────────────────────────────────

function AIStudioPage({
  isPremium = false,
  onUpgrade,
}: { isPremium?: boolean; onUpgrade?: (feat: string) => void } = {}) {
  const [activeTab, setActiveTab] = useState<"caption" | "bio" | "hashtags">(
    "caption",
  );
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [outputTags, setOutputTags] = useState<string[]>([]);
  const [aiUsageCount, setAiUsageCount] = useState(0);
  const FREE_LIMIT = 3;

  const tabConfig = {
    caption: {
      label: "Caption",
      icon: "✍️",
      placeholder:
        "Describe your photo... e.g. sunset at the beach with friends",
      buttonText: "Generate Captions",
    },
    bio: {
      label: "Bio",
      icon: "👤",
      placeholder:
        "Tell about yourself... e.g. travel lover, foodie, photographer from Mumbai",
      buttonText: "Generate Bio",
    },
    hashtags: {
      label: "Hashtags",
      icon: "#️⃣",
      placeholder:
        "What's your post about? e.g. morning yoga, healthy lifestyle, travel",
      buttonText: "Generate Hashtags",
    },
  };

  function generateMockContent(tab: string, userPrompt: string): string {
    const words = userPrompt
      .toLowerCase()
      .split(" ")
      .filter((w) => w.length > 2);
    const kw1 = words[0] || "life";
    const kw2 = words[1] || "moments";
    if (tab === "caption") {
      return [
        `✨ ${userPrompt.charAt(0).toUpperCase() + userPrompt.slice(1)} — because some moments are too beautiful not to share 🌟`,
        `Living for these ${kw1} vibes ✨ Every ${kw2} tells a story, and this one is mine 💫 #blessed #grateful`,
        `When ${kw1} meets ${kw2}, magic happens 🔥 Embracing every moment of this journey 🚀 Drop a ❤️ if you feel this!`,
      ].join("\n\n");
    }
    if (tab === "bio") {
      return `✨ ${kw1.charAt(0).toUpperCase() + kw1.slice(1)} enthusiast & ${kw2} lover 🌍\nCreating memories one ${kw1} at a time 📸\nDM for collabs 💌\n🏆 Top Creator 2024`;
    }
    const base = words.concat([
      "instagram",
      "trending",
      "viral",
      "reels",
      "explore",
      "instagood",
      "photooftheday",
      "instadaily",
      "love",
      "lifestyle",
      "photography",
      "motivation",
      "inspiration",
      "happy",
      "follow",
      "like",
      "share",
      "content",
      "creator",
      "india",
    ]);
    return base
      .slice(0, 20)
      .map((w) => `#${w}`)
      .join(" ");
  }

  const BAD_WORDS = [
    "hate",
    "kill",
    "sex",
    "porn",
    "nude",
    "nsfw",
    "fuck",
    "shit",
    "ass",
    "bitch",
    "cunt",
    "slut",
    "whore",
  ];
  function filterContent(text: string): string {
    let filtered = text;
    for (const w of BAD_WORDS) {
      const re = new RegExp(w, "gi");
      filtered = filtered.replace(re, "***");
    }
    return filtered;
  }

  async function handleGenerate() {
    if (!prompt.trim()) return;
    if (!isPremium && aiUsageCount >= FREE_LIMIT) {
      if (onUpgrade)
        onUpgrade(
          "You've used 3 free AI generations today. Upgrade for unlimited access.",
        );
      return;
    }
    setAiUsageCount((c) => c + 1);
    setLoading(true);
    setError("");
    setOutput("");
    setOutputTags([]);
    try {
      if (activeTab === "hashtags") {
        const apiPrompt = `Generate 20 relevant Instagram hashtags for: "${prompt}". Return only hashtags separated by spaces, no explanation.`;
        let tags: string[] = [];
        try {
          const res = await fetch(
            `https://text.pollinations.ai/${encodeURIComponent(apiPrompt)}`,
          );
          if (res.ok) {
            const text = await res.text();
            tags = text
              .trim()
              .split(/\s+/)
              .map((t: string) => (t.startsWith("#") ? t : `#${t}`))
              .filter((t: string) => t.length > 1 && t.length < 30)
              .slice(0, 20);
          }
        } catch {}
        if (tags.length < 5) {
          const fallback = generateMockContent("hashtags", prompt);
          tags = fallback
            .split(" ")
            .filter((t) => t.startsWith("#"))
            .slice(0, 20);
        }
        setOutputTags(tags.map((t) => filterContent(t)));
      } else {
        let result = "";
        const apiPrompt =
          activeTab === "caption"
            ? `Write 3 creative Instagram captions for: "${prompt}". Each caption should be engaging with emojis, under 200 characters. Separate with blank lines.`
            : `Write a short engaging Instagram bio for: "${prompt}". Include emojis, under 150 characters, memorable.`;
        try {
          const res = await fetch(
            `https://text.pollinations.ai/${encodeURIComponent(apiPrompt)}`,
          );
          if (res.ok) result = await res.text();
        } catch {}
        if (!result || result.length < 10)
          result = generateMockContent(activeTab, prompt);
        setOutput(filterContent(result));
      }
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    const text = activeTab === "hashtags" ? outputTags.join(" ") : output;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard! 📋");
  }

  async function handleCopyTag(tag: string) {
    await navigator.clipboard.writeText(tag).catch(() => {});
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  }

  function handleClear() {
    setPrompt("");
    setOutput("");
    setOutputTags([]);
    setError("");
  }

  const hasResult = output.length > 0 || outputTags.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-10" data-ocid="ai.page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pt-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--app-text)" }}
          >
            ✨ AI Studio
          </h1>
          <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
            Fast · Easy · Powerful — AI-powered content
          </p>
        </div>
      </div>

      {/* AI Disclaimer Banner */}
      <div
        className="flex items-start gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
        style={{
          backgroundColor: "rgba(234,179,8,0.12)",
          border: "1px solid rgba(234,179,8,0.4)",
          color: "var(--app-text)",
        }}
        data-ocid="ai.disclaimer.panel"
      >
        <span className="text-base flex-shrink-0">⚠️</span>
        <span
          className="text-xs leading-relaxed"
          style={{ color: "var(--app-text)" }}
        >
          <strong>Disclaimer:</strong> AI generated content may be inaccurate.
          Always review before posting.
        </span>
      </div>

      {/* Pill Tabs */}
      <div
        className="flex gap-1.5 p-1 rounded-2xl mb-5"
        style={{ backgroundColor: "var(--app-bg)" }}
        role="tablist"
        data-ocid="ai.tab"
      >
        {(["caption", "bio", "hashtags"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => {
              setActiveTab(tab);
              handleClear();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={
              activeTab === tab
                ? {
                    background: "linear-gradient(135deg, #7c3aed, #f97316)",
                    color: "#fff",
                  }
                : { color: "var(--app-text-muted)", background: "transparent" }
            }
            data-ocid="ai.tab"
          >
            <span className="text-base">{tabConfig[tab].icon}</span>
            <span>{tabConfig[tab].label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {/* Textarea */}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={tabConfig[activeTab].placeholder}
          rows={4}
          className="resize-none rounded-2xl border-2 text-sm"
          style={{
            backgroundColor: "var(--app-card)",
            borderColor: prompt ? "var(--app-accent)" : "var(--app-border)",
            color: "var(--app-text)",
          }}
          data-ocid="ai.write.textarea"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleGenerate();
          }}
        />

        {/* Action row */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1 h-12 rounded-xl font-bold text-white text-sm shadow-md"
            style={{
              background:
                loading || !prompt.trim()
                  ? "var(--app-text-muted)"
                  : "linear-gradient(135deg, #7c3aed, #f97316)",
              border: "none",
            }}
            data-ocid="ai.write.submit_button"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {tabConfig[activeTab].buttonText}
              </>
            )}
          </Button>
          {(prompt.length > 0 || hasResult) && (
            <Button
              onClick={handleClear}
              variant="outline"
              className="h-12 px-4 rounded-xl text-sm"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text-muted)",
              }}
              data-ocid="ai.write.secondary_button"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ backgroundColor: "var(--app-bg)" }}
            data-ocid="ai.write.loading_state"
          >
            <Loader2
              className="w-5 h-5 animate-spin flex-shrink-0"
              style={{ color: "var(--app-accent)" }}
            />
            <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
              {activeTab === "caption" &&
                "Creating amazing captions for you..."}
              {activeTab === "bio" && "Writing your perfect bio..."}
              {activeTab === "hashtags" &&
                "Finding the best trending hashtags..."}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="p-4 rounded-2xl text-sm"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#ef4444" }}
            data-ocid="ai.write.error_state"
          >
            ❌ {error}
          </div>
        )}

        {/* Caption / Bio output */}
        {output && activeTab !== "hashtags" && (
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
            data-ocid="ai.write.success_state"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "var(--app-text-muted)" }}
              >
                {activeTab === "caption"
                  ? "✍️ Generated Captions"
                  : "👤 Generated Bio"}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: copied
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(196,77,255,0.15)",
                  color: copied ? "#22c55e" : "#7c3aed",
                  border: `1px solid ${copied ? "#22c55e" : "#7c3aed"}`,
                }}
                data-ocid="ai.write.button"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy All"}
              </button>
            </div>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--app-text)" }}
            >
              {output}
            </p>
          </div>
        )}

        {/* Hashtags chips output */}
        {outputTags.length > 0 && activeTab === "hashtags" && (
          <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
            data-ocid="ai.hashtag.success_state"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: "var(--app-text-muted)" }}
              >
                #️⃣ {outputTags.length} Hashtags — tap to copy
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: copied
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(196,77,255,0.15)",
                  color: copied ? "#22c55e" : "#7c3aed",
                  border: `1px solid ${copied ? "#22c55e" : "#7c3aed"}`,
                }}
                data-ocid="ai.hashtag.button"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy All"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {outputTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleCopyTag(tag)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{
                    backgroundColor:
                      copiedTag === tag
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(196,77,255,0.12)",
                    color: copiedTag === tag ? "#22c55e" : "#7c3aed",
                    border: `1px solid ${copiedTag === tag ? "#22c55e" : "rgba(196,77,255,0.4)"}`,
                  }}
                  data-ocid="ai.hashtag.button"
                >
                  {copiedTag === tag ? "✓ Copied" : tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Report AI Content button */}
        {hasResult && (
          <button
            type="button"
            onClick={() =>
              toast.success("Reported. Thank you for your feedback.")
            }
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-destructive/10"
            style={{
              borderColor: "var(--app-border)",
              color: "var(--app-text-muted)",
            }}
            data-ocid="ai.write.secondary_button"
          >
            🚩 Report AI Content
          </button>
        )}

        {/* Tips when no result */}
        {!hasResult && !loading && (
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: "var(--app-bg)",
              border: "1px dashed var(--app-border)",
            }}
          >
            <p
              className="text-xs font-bold mb-2"
              style={{ color: "var(--app-text-muted)" }}
            >
              💡 Tips for {tabConfig[activeTab].label}
            </p>
            <ul
              className="text-xs space-y-1.5"
              style={{ color: "var(--app-text-muted)" }}
            >
              {activeTab === "caption" && (
                <>
                  <li>• Be specific about your photo/video content</li>
                  <li>• Include mood, setting, or activity</li>
                  <li>• Use Ctrl+Enter to generate quickly</li>
                </>
              )}
              {activeTab === "bio" && (
                <>
                  <li>• Include your passion and profession</li>
                  <li>• Mention what makes you unique</li>
                  <li>• Keep it authentic and engaging</li>
                </>
              )}
              {activeTab === "hashtags" && (
                <>
                  <li>• Describe content type and niche</li>
                  <li>• Include your industry keywords</li>
                  <li>• Tap any hashtag chip to copy it</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LANDING PAGE ──────────────────────────────────────────────────────────────
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const features = [
    {
      icon: "📸",
      title: "Share Posts",
      desc: "Share photos, reels, and stories with your community instantly.",
    },
    {
      icon: "🤝",
      title: "Connect with People",
      desc: "Follow creators, friends, and businesses. Build your network.",
    },
    {
      icon: "✨",
      title: "AI Studio",
      desc: "Generate captions, bios, and hashtags using built-in AI tools.",
    },
  ];
  const benefits = [
    {
      icon: "🎓",
      title: "Students",
      desc: "Share campus life, connect with classmates and clubs.",
    },
    {
      icon: "🎨",
      title: "Creators",
      desc: "Grow your audience with reels, stories, and AI-powered captions.",
    },
    {
      icon: "💼",
      title: "Business",
      desc: "Reach customers, run demo ads, and build brand presence.",
    },
    {
      icon: "🌍",
      title: "Everyone",
      desc: "A safe, modern social app for all ages 13 and above.",
    },
  ];
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b border-border backdrop-blur-sm"
        style={{ backgroundColor: "var(--app-nav)" }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1
            className="text-xl font-extrabold"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connectly
          </h1>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onGetStarted}
              className="px-4 py-1.5 text-sm rounded-full border border-border hover:bg-muted transition-colors"
              style={{ color: "var(--app-text)" }}
              data-ocid="landing.login.button"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="px-4 py-1.5 text-sm rounded-full font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
              }}
              data-ocid="landing.primary_button"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="max-w-3xl mx-auto px-4 py-20 text-center"
        data-ocid="landing.section"
      >
        <h2
          className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Connectly — Share Your World
        </h2>
        <p className="text-lg mb-8" style={{ color: "var(--app-text-muted)" }}>
          The social app for students, creators &amp; businesses
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onGetStarted}
            className="px-8 py-3 rounded-2xl font-bold text-white text-base shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
            data-ocid="landing.primary_button"
          >
            🚀 Get Started Free
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="px-8 py-3 rounded-2xl font-semibold text-base border border-border hover:bg-muted transition-colors"
            style={{ color: "var(--app-text)" }}
            data-ocid="landing.secondary_button"
          >
            Log In
          </button>
        </div>
      </section>

      {/* What is Connectly */}
      <section
        className="max-w-5xl mx-auto px-4 py-12"
        data-ocid="landing.section"
      >
        <h3
          className="text-2xl font-bold text-center mb-8"
          style={{ color: "var(--app-text)" }}
        >
          What is Connectly?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6 text-center"
              style={{
                backgroundColor: "var(--app-card)",
                border: "1px solid var(--app-border)",
              }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h4
                className="font-bold text-base mb-2"
                style={{ color: "var(--app-text)" }}
              >
                {f.title}
              </h4>
              <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why use Connectly */}
      <section
        className="max-w-5xl mx-auto px-4 py-12"
        data-ocid="landing.section"
      >
        <h3
          className="text-2xl font-bold text-center mb-8"
          style={{ color: "var(--app-text)" }}
        >
          Why use Connectly?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl p-5 text-center"
              style={{
                backgroundColor: "var(--app-card)",
                border: "1px solid var(--app-border)",
              }}
            >
              <div className="text-3xl mb-2">{b.icon}</div>
              <h4
                className="font-bold text-sm mb-1"
                style={{ color: "var(--app-text)" }}
              >
                {b.title}
              </h4>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mock app screenshots */}
      <section
        className="max-w-5xl mx-auto px-4 py-12"
        data-ocid="landing.section"
      >
        <h3
          className="text-2xl font-bold text-center mb-8"
          style={{ color: "var(--app-text)" }}
        >
          Beautiful, Fast & Easy
        </h3>
        <div className="flex justify-center gap-4 flex-wrap">
          {["Feed", "Reels", "Stories", "AI Studio"].map((screen) => (
            <div
              key={screen}
              className="w-36 h-64 rounded-3xl flex flex-col overflow-hidden shadow-xl border-4"
              style={{
                borderColor: "var(--app-border)",
                backgroundColor: "var(--app-card)",
              }}
            >
              <div
                className="h-6 flex items-center justify-center text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #f97316)",
                  color: "#fff",
                }}
              >
                {screen}
              </div>
              <div className="flex-1 flex flex-col gap-2 p-2">
                {["a", "b", "c"].map((k) => (
                  <div
                    key={k}
                    className="rounded-lg"
                    style={{
                      height: "40px",
                      backgroundColor: "var(--app-bg)",
                      opacity: 0.7,
                    }}
                  />
                ))}
                <div
                  className="rounded-full mx-auto mt-auto"
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "linear-gradient(135deg, #7c3aed, #f97316)",
                    opacity: 0.5,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="max-w-2xl mx-auto px-4 py-16 text-center"
        data-ocid="landing.section"
      >
        <h3
          className="text-3xl font-extrabold mb-4"
          style={{ color: "var(--app-text)" }}
        >
          Ready to connect?
        </h3>
        <p
          className="text-base mb-8"
          style={{ color: "var(--app-text-muted)" }}
        >
          Join thousands of users already sharing their world on Connectly.
        </p>
        <button
          type="button"
          onClick={onGetStarted}
          className="px-10 py-4 rounded-2xl font-bold text-white text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
          data-ocid="landing.primary_button"
        >
          Join Connectly Free
        </button>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-border py-8"
        style={{ backgroundColor: "var(--app-card)" }}
      >
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #f97316)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Connectly
          </p>
          <div
            className="flex flex-wrap gap-4 text-xs"
            style={{ color: "var(--app-text-muted)" }}
          >
            <button
              type="button"
              className="hover:underline"
              data-ocid="landing.about.link"
            >
              About
            </button>
            <button
              type="button"
              className="hover:underline"
              data-ocid="landing.privacy.link"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className="hover:underline"
              data-ocid="landing.terms.link"
            >
              Terms of Service
            </button>
            <button
              type="button"
              className="hover:underline"
              data-ocid="landing.contact.link"
            >
              Contact
            </button>
          </div>
          <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
            © {new Date().getFullYear()} Connectly. Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "connectly")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--app-accent)" }}
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── ABOUT PAGE ──────────────────────────────────────────────────────────────
function AboutPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6" data-ocid="about.page">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-70"
        style={{ color: "var(--app-text-muted)" }}
        data-ocid="about.back.button"
      >
        ← Back
      </button>
      <h1
        className="text-2xl font-extrabold mb-2"
        style={{ color: "var(--app-text)" }}
      >
        About Connectly
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--app-text-muted)" }}>
        Version 1.0.0
      </p>
      <div className="space-y-5 text-sm" style={{ color: "var(--app-text)" }}>
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2 className="font-bold text-base mb-2">🎯 Our Mission</h2>
          <p style={{ color: "var(--app-text-muted)" }}>
            Connectly is a modern social media platform built to help students,
            creators, and businesses share their stories, grow their audience,
            and connect with people who matter — all in a safe, fast, and
            beautiful app.
          </p>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2 className="font-bold text-base mb-2">👥 Who is it for?</h2>
          <ul className="space-y-2" style={{ color: "var(--app-text-muted)" }}>
            <li>
              🎓 <strong>Students</strong> — Share campus life, connect with
              classmates
            </li>
            <li>
              🎨 <strong>Creators</strong> — Build your audience with reels and
              AI captions
            </li>
            <li>
              💼 <strong>Businesses</strong> — Reach customers and build brand
              presence
            </li>
            <li>
              🌍 <strong>Everyone 13+</strong> — A safe, inclusive social space
            </li>
          </ul>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2 className="font-bold text-base mb-2">✨ Key Features</h2>
          <ul className="space-y-1" style={{ color: "var(--app-text-muted)" }}>
            <li>• Posts, Stories & Reels</li>
            <li>• AI Studio (captions, bios, hashtags)</li>
            <li>• Direct Messaging & Chat</li>
            <li>• Privacy Controls & Safety Tools</li>
            <li>• Internet Identity & Email Login</li>
          </ul>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2 className="font-bold text-base mb-2">📧 Contact</h2>
          <p style={{ color: "var(--app-text-muted)" }}>
            support@connectly.app
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PRIVACY POLICY PAGE ──────────────────────────────────────────────────────
function PrivacyPolicyPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6" data-ocid="privacy.page">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-70"
        style={{ color: "var(--app-text-muted)" }}
        data-ocid="privacy.back.button"
      >
        ← Back
      </button>
      <h1
        className="text-2xl font-extrabold mb-2"
        style={{ color: "var(--app-text)" }}
      >
        Privacy Policy
      </h1>
      <p className="text-xs mb-6" style={{ color: "var(--app-text-muted)" }}>
        Last updated: April 2026
      </p>
      <div
        className="space-y-4 text-sm"
        style={{ color: "var(--app-text-muted)" }}
      >
        {[
          {
            title: "1. Information We Collect",
            body: "We collect information you provide directly, such as your name, username, email, profile photo, bio, and posts. We also collect usage data like pages visited and features used to improve your experience.",
          },
          {
            title: "2. How We Use Your Information",
            body: "Your data is used to provide and improve the Connectly service, personalize your feed, enable AI features, and send notifications. We do not sell your personal information to third parties.",
          },
          {
            title: "3. Data Storage",
            body: "Profile data, posts, and preferences are stored locally on your device using localStorage. No sensitive data is transmitted to external servers beyond what is required for AI content generation.",
          },
          {
            title: "4. AI Content",
            body: "When you use AI Studio, your prompts are sent to a third-party AI service (Pollinations AI). Do not include sensitive personal information in your prompts.",
          },
          {
            title: "5. Cookies & Tracking",
            body: "We do not use tracking cookies. Session data is stored in your browser's localStorage only.",
          },
          {
            title: "6. Children's Privacy",
            body: "Connectly is intended for users aged 13 and above. If you are under 13, please do not use this service.",
          },
          {
            title: "7. Contact",
            body: "For privacy concerns, contact us at: support@connectly.app",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
          >
            <h2 className="font-bold mb-2" style={{ color: "var(--app-text)" }}>
              {section.title}
            </h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TERMS PAGE ───────────────────────────────────────────────────────────────
function TermsPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6" data-ocid="terms.page">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-70"
        style={{ color: "var(--app-text-muted)" }}
        data-ocid="terms.back.button"
      >
        ← Back
      </button>
      <h1
        className="text-2xl font-extrabold mb-2"
        style={{ color: "var(--app-text)" }}
      >
        Terms of Service
      </h1>
      <p className="text-xs mb-6" style={{ color: "var(--app-text-muted)" }}>
        Last updated: April 2026
      </p>
      <div
        className="space-y-4 text-sm"
        style={{ color: "var(--app-text-muted)" }}
      >
        {[
          {
            title: "1. Acceptance",
            body: "By using Connectly, you agree to these Terms of Service. If you do not agree, please do not use the app.",
          },
          {
            title: "2. Age Requirement",
            body: "You must be at least 13 years old to use Connectly. By creating an account, you confirm you meet this requirement.",
          },
          {
            title: "3. Community Guidelines",
            body: "Connectly is a positive, respectful community. You agree to not post content that is hateful, discriminatory, sexually explicit, violent, or otherwise harmful.",
          },
          {
            title: "4. Prohibited Content",
            body: "The following is strictly prohibited: child sexual abuse material (CSAM), nudity or pornographic content, hate speech targeting any group, content promoting violence or illegal activity, spam or impersonation of others.",
          },
          {
            title: "5. Reporting",
            body: "Users can report inappropriate content using the Report button on any post or profile. Reported content is reviewed and removed if it violates these terms.",
          },
          {
            title: "6. Account Termination",
            body: "We reserve the right to suspend or delete accounts that violate these terms without prior notice.",
          },
          {
            title: "7. Disclaimer",
            body: "Connectly is provided as-is. AI-generated content may be inaccurate; always review before posting. Ads labeled 'Sponsored · Demo Ad' are for demonstration purposes only.",
          },
          {
            title: "8. Contact",
            body: "Questions about these terms? Contact us at: support@connectly.app",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-2xl p-4"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
          >
            <h2 className="font-bold mb-2" style={{ color: "var(--app-text)" }}>
              {section.title}
            </h2>
            <p>{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6" data-ocid="contact.page">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-sm hover:opacity-70"
        style={{ color: "var(--app-text-muted)" }}
        data-ocid="contact.back.button"
      >
        ← Back
      </button>
      <h1
        className="text-2xl font-extrabold mb-6"
        style={{ color: "var(--app-text)" }}
      >
        Contact Us
      </h1>
      <div className="space-y-4">
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2
            className="font-bold text-base mb-3"
            style={{ color: "var(--app-text)" }}
          >
            📧 Support Email
          </h2>
          <a
            href="mailto:support@connectly.app"
            className="text-sm hover:underline"
            style={{ color: "#60a5fa" }}
          >
            support@connectly.app
          </a>
          <p
            className="text-xs mt-2"
            style={{ color: "var(--app-text-muted)" }}
          >
            We typically respond within 24-48 hours.
          </p>
        </div>
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
        >
          <h2
            className="font-bold text-base mb-3"
            style={{ color: "var(--app-text)" }}
          >
            ❓ FAQ
          </h2>
          <div className="space-y-3 text-sm">
            {[
              {
                q: "How do I change my profile picture?",
                a: "Go to Profile → tap your avatar → Edit Profile.",
              },
              {
                q: "How do I make my account private?",
                a: "Profile → Settings (gear icon) → Privacy Settings → Toggle Private Account.",
              },
              {
                q: "How do I report a post?",
                a: "Tap the ⋯ (more) button on any post → Report.",
              },
              {
                q: "Is Connectly free?",
                a: "Yes! Connectly is completely free to use. A Pro plan is coming soon.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="border-b pb-3 last:border-0 last:pb-0"
                style={{ borderColor: "var(--app-border)" }}
              >
                <p
                  className="font-semibold mb-1"
                  style={{ color: "var(--app-text)" }}
                >
                  {faq.q}
                </p>
                <p style={{ color: "var(--app-text-muted)" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Traditional Auth Hook =====
interface TraditionalUser {
  email: string;
  name: string;
  principalId: string;
}

function useTraditionalAuth() {
  const [tradUser, setTradUser] = useState<TraditionalUser | null>(() => {
    try {
      const stored = localStorage.getItem("connectly_trad_session");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [tradError, setTradError] = useState<string | null>(null);

  function tradLogin(email: string, pass: string) {
    setTradError(null);
    try {
      const accounts: Record<string, { name: string; passwordHash: string }> =
        JSON.parse(localStorage.getItem("connectly_accounts") || "{}");
      const account = accounts[email.toLowerCase()];
      if (!account) {
        setTradError("Account not found. Please sign up first.");
        return false;
      }
      if (account.passwordHash !== btoa(pass)) {
        setTradError("Incorrect password. Please try again.");
        return false;
      }
      const user: TraditionalUser = {
        email: email.toLowerCase(),
        name: account.name,
        principalId: `traditional-${btoa(email.toLowerCase()).slice(0, 16)}`,
      };
      localStorage.setItem("connectly_trad_session", JSON.stringify(user));
      setTradUser(user);
      return true;
    } catch {
      setTradError("Login failed. Please try again.");
      return false;
    }
  }

  function tradSignup(name: string, email: string, pass: string) {
    setTradError(null);
    try {
      const accounts: Record<string, { name: string; passwordHash: string }> =
        JSON.parse(localStorage.getItem("connectly_accounts") || "{}");
      if (accounts[email.toLowerCase()]) {
        setTradError("Account already exists. Please sign in.");
        return false;
      }
      accounts[email.toLowerCase()] = { name, passwordHash: btoa(pass) };
      localStorage.setItem("connectly_accounts", JSON.stringify(accounts));
      const user: TraditionalUser = {
        email: email.toLowerCase(),
        name,
        principalId: `traditional-${btoa(email.toLowerCase()).slice(0, 16)}`,
      };
      localStorage.setItem("connectly_trad_session", JSON.stringify(user));
      setTradUser(user);
      return true;
    } catch {
      setTradError("Sign up failed. Please try again.");
      return false;
    }
  }

  function tradLogout() {
    localStorage.removeItem("connectly_trad_session");
    setTradUser(null);
    setTradError(null);
  }

  return {
    tradUser,
    tradLogin,
    tradSignup,
    tradLogout,
    tradError,
    setTradError,
  };
}

function LoginScreen({
  onLogin,
  isLoggingIn,
  onTradLogin,
  onTradSignup,
  tradError,
}: {
  onLogin: () => void;
  isLoggingIn: boolean;
  onTradLogin: (email: string, pass: string) => boolean;
  onTradSignup: (name: string, email: string, pass: string) => boolean;
  tradError: string | null;
}) {
  const [loginTab, setLoginTab] = useState<"biometric" | "email">("biometric");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPass, setFormPass] = useState("");
  const [formConfirmPass, setFormConfirmPass] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleTradSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (!formEmail || !formPass) {
      setLocalError("Please fill in all fields.");
      return;
    }
    if (authMode === "signup") {
      if (!formName) {
        setLocalError("Please enter your name.");
        return;
      }
      if (formPass !== formConfirmPass) {
        setLocalError("Passwords do not match.");
        return;
      }
      if (formPass.length < 6) {
        setLocalError("Password must be at least 6 characters.");
        return;
      }
      onTradSignup(formName, formEmail, formPass);
    } else {
      onTradLogin(formEmail, formPass);
    }
  }

  const displayError = localError || tradError;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ backgroundColor: "var(--app-bg)" }}
      data-ocid="login.page"
    >
      {/* Background gradient blobs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #c44dff, transparent)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #ff6b9d, transparent)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="rounded-2xl p-1"
            style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
          >
            <div
              className="rounded-xl p-3"
              style={{ backgroundColor: "var(--app-bg)" }}
            >
              <img
                src="/assets/generated/connectly-logo-transparent.dim_120x120.png"
                alt="Connectly"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <h1
              className="text-4xl font-extrabold tracking-tight"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #f97316)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Connectly
            </h1>
            <p
              className="mt-2 text-base"
              style={{ color: "var(--app-text-muted)" }}
            >
              Connect, Share, Inspire
            </p>
          </div>
        </div>

        {/* Features */}
        <div
          className="w-full rounded-2xl border border-border p-5 flex flex-col gap-3"
          style={{ backgroundColor: "var(--app-card)" }}
        >
          {[
            { icon: "📸", text: "Share moments with the world" },
            { icon: "🎬", text: "Discover trending Reels" },
            { icon: "💬", text: "Connect via private messages" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm" style={{ color: "var(--app-text)" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div
          className="w-full flex rounded-xl p-1 gap-1"
          style={{ backgroundColor: "var(--app-card)" }}
        >
          {(["biometric", "email"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLoginTab(tab)}
              className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150"
              style={
                loginTab === tab
                  ? {
                      background: "linear-gradient(135deg, #7c3aed, #f97316)",
                      color: "#fff",
                    }
                  : {
                      color: "var(--app-text-muted)",
                      background: "transparent",
                    }
              }
              data-ocid={tab === "biometric" ? "login.tab" : "login.tab"}
            >
              {tab === "biometric" ? "🔐 Biometric" : "📧 Email"}
            </button>
          ))}
        </div>

        {loginTab === "biometric" ? (
          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full h-12 rounded-xl font-semibold text-base text-white"
              style={{
                background: isLoggingIn
                  ? "var(--app-text-muted)"
                  : "linear-gradient(135deg, #7c3aed, #f97316)",
                border: "none",
              }}
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
            <div
              className="flex items-center justify-center gap-2 text-xs"
              style={{ color: "var(--app-text-muted)" }}
            >
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span>
                Secure, passwordless login powered by Internet Computer
              </span>
            </div>
          </div>
        ) : (
          <div
            className="w-full rounded-2xl border border-border p-5"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            {/* Sign In / Sign Up toggle */}
            <div className="flex gap-3 mb-4">
              {(["signin", "signup"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setAuthMode(mode);
                    setLocalError(null);
                  }}
                  className="text-sm font-semibold pb-1 border-b-2 transition-colors"
                  style={
                    authMode === mode
                      ? { borderColor: "#c44dff", color: "#7c3aed" }
                      : {
                          borderColor: "transparent",
                          color: "var(--app-text-muted)",
                        }
                  }
                  data-ocid={mode === "signin" ? "login.tab" : "login.tab"}
                >
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleTradSubmit} className="flex flex-col gap-3">
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{ color: "var(--app-text)" }}
                  data-ocid="login.input"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500"
                style={{ color: "var(--app-text)" }}
                data-ocid="login.input"
              />
              <input
                type="password"
                placeholder="Password"
                value={formPass}
                onChange={(e) => setFormPass(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500"
                style={{ color: "var(--app-text)" }}
                data-ocid="login.input"
              />
              {authMode === "signup" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={formConfirmPass}
                  onChange={(e) => setFormConfirmPass(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-500"
                  style={{ color: "var(--app-text)" }}
                  data-ocid="login.input"
                />
              )}
              {displayError && (
                <p
                  className="text-xs text-red-400 text-center"
                  data-ocid="login.error_state"
                >
                  {displayError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full h-10 rounded-xl font-semibold text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #f97316)",
                  border: "none",
                }}
                data-ocid="login.submit_button"
              >
                {authMode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CREATE POST DIALOG ───────────────────────────────────────────────────────

function CreatePostDialog({
  open,
  onClose,
  onPost,
  profile,
}: {
  open: boolean;
  onClose: () => void;
  onPost: (post: Post) => void;
  profile: ProfileState;
}) {
  const [postType, setPostType] = useState<"image" | "reel">("image");
  const [imageUrl, setImageUrl] = useState("");
  const [filePreview, setFilePreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [hashtagError, setHashtagError] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setPostType("image");
    setImageUrl("");
    setFilePreview("");
    setCaption("");
    setSuggestedHashtags([]);
    setHashtagError("");
    setLocation("");
    setMood("");
    setWebsiteLink("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFilePreview(url);
  }

  async function handleSuggestHashtags() {
    if (!caption.trim()) return;
    setHashtagLoading(true);
    setHashtagError("");
    setSuggestedHashtags([]);
    try {
      const prompt = `Generate 15 relevant Instagram hashtags for this caption: "${caption}". Return only the hashtags separated by spaces, no explanation, no numbering.`;
      const res = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
      );
      if (!res.ok) throw new Error("Failed");
      const text = await res.text();
      const tokens = text
        .trim()
        .split(/\s+/)
        .map((t: string) => (t.startsWith("#") ? t : `#${t}`))
        .filter((t: string) => t.length > 1);
      setSuggestedHashtags(tokens.slice(0, 15));
    } catch {
      setHashtagError("Hashtags suggest नहीं हो सके। दोबारा try करें।");
    } finally {
      setHashtagLoading(false);
    }
  }

  function handleAppendHashtag(tag: string) {
    setCaption((prev) => (prev.trim() ? `${prev} ${tag}` : tag));
  }

  function handlePost() {
    const currentUser: AppUser = {
      id: 0,
      name: profile.name,
      username: profile.username,
      avatar: profile.avatar,
      bio: profile.bio,
      followers: 1248,
      following: 342,
      posts: 24,
    };
    const mediaUrl =
      filePreview ||
      imageUrl.trim() ||
      `https://picsum.photos/seed/${Date.now()}/800/600`;
    const newPost: Post = {
      id: Date.now(),
      user: currentUser,
      image:
        postType === "image"
          ? mediaUrl
          : `https://picsum.photos/seed/${Date.now()}/800/600`,
      videoUrl: postType === "reel" ? mediaUrl : undefined,
      type: postType,
      caption,
      location: location.trim() || undefined,
      mood: mood || undefined,
      websiteLink: websiteLink.trim()
        ? websiteLink.startsWith("http")
          ? websiteLink.trim()
          : `https://${websiteLink.trim()}`
        : undefined,
      hashtags: [],
      likes: 0,
      comments: 0,
      commentList: [],
      time: "Just now",
      isLiked: false,
      isBookmarked: false,
    };
    onPost(newPost);
    resetState();
    onClose();
    toast.success(postType === "reel" ? "Reel shared! 🎬" : "Post shared! 🎉");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetState();
          onClose();
        }
      }}
    >
      <DialogContent
        className="max-w-md w-full"
        style={{
          backgroundColor: "var(--app-panel)",
          border: "1px solid var(--app-border)",
        }}
        data-ocid="create_post.dialog"
      >
        <DialogHeader>
          <DialogTitle style={{ color: "var(--app-text)" }}>
            New Post बनाएं
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Type selector: Image or Reel */}
          <div
            className="flex gap-2 p-1 rounded-xl"
            style={{ backgroundColor: "var(--app-bg)" }}
          >
            {(["image", "reel"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setPostType(type);
                  setFilePreview("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={
                  postType === type
                    ? {
                        background: "linear-gradient(135deg, #7c3aed, #f97316)",
                        color: "#fff",
                      }
                    : {
                        color: "var(--app-text-muted)",
                        background: "transparent",
                      }
                }
                data-ocid={`create_post.${type}.tab`}
              >
                {type === "image" ? "📷 Image" : "🎬 Reel"}
              </button>
            ))}
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              {postType === "image" ? "Photo चुनें" : "Video चुनें"}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all hover:opacity-80"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text-muted)",
              }}
              data-ocid="create_post.upload_button"
            >
              <Camera className="w-5 h-5" />
              {filePreview
                ? "File selected ✓"
                : postType === "image"
                  ? "Photo upload करें"
                  : "Video upload करें"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={postType === "image" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              className="hidden"
              data-ocid="create_post.dropzone"
            />
            {/* Preview */}
            {filePreview && postType === "image" && (
              <img
                src={filePreview}
                alt="preview"
                className="w-full rounded-xl object-cover"
                style={{ maxHeight: 200 }}
              />
            )}
            {filePreview && postType === "reel" && (
              <video
                src={filePreview}
                controls
                muted
                className="w-full rounded-xl"
                style={{ maxHeight: 200 }}
              />
            )}
          </div>

          {/* OR URL fallback for image */}
          {postType === "image" && !filePreview && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="create-post-image"
                className="text-xs font-medium"
                style={{ color: "var(--app-text-muted)" }}
              >
                या Image URL (optional)
              </label>
              <Input
                id="create-post-image"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{
                  backgroundColor: "var(--app-input)",
                  borderColor: "var(--app-border)",
                  color: "var(--app-text)",
                }}
                data-ocid="create_post.input"
              />
              {imageUrl.trim() && (
                <img
                  src={imageUrl}
                  alt="preview"
                  className="rounded-xl object-cover w-full h-40 mt-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>
          )}

          {/* Caption */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-post-caption"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              Caption लिखें
            </label>
            <Textarea
              id="create-post-caption"
              placeholder="अपनी post के बारे में लिखें..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              style={{
                backgroundColor: "var(--app-input)",
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
                resize: "none",
              }}
              data-ocid="create_post.textarea"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-post-location"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              📍 Location add करें
            </label>
            <Input
              id="create-post-location"
              placeholder="City, Place या Address..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                backgroundColor: "var(--app-input)",
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
              data-ocid="create_post.input"
            />
          </div>

          {/* Website Link */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="create-post-website"
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              🔗 Website Link (optional)
            </label>
            <Input
              id="create-post-website"
              placeholder="Add a link (optional)"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              style={{
                backgroundColor: "var(--app-input)",
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
              data-ocid="create_post.input"
            />
          </div>

          {/* Mood / Feeling */}
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--app-text-muted)" }}
            >
              😊 Mood / Feeling
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { emoji: "😊", label: "Happy" },
                { emoji: "😍", label: "Loved" },
                { emoji: "🥳", label: "Excited" },
                { emoji: "😎", label: "Cool" },
                { emoji: "😔", label: "Sad" },
                { emoji: "🤩", label: "Amazing" },
                { emoji: "😴", label: "Tired" },
                { emoji: "🙏", label: "Grateful" },
                { emoji: "🔥", label: "Motivated" },
                { emoji: "😂", label: "Funny" },
                { emoji: "🌟", label: "Blessed" },
                { emoji: "💪", label: "Strong" },
              ].map(({ emoji, label }) => {
                const value = `${emoji} ${label}`;
                const selected = mood === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMood(selected ? "" : value)}
                    className="px-3 py-1.5 rounded-full text-xs transition-all active:scale-95"
                    style={
                      selected
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(255,107,157,0.2), rgba(196,77,255,0.2))",
                            border: "1px solid rgba(196,77,255,0.6)",
                            color: "#7c3aed",
                            fontWeight: 600,
                          }
                        : {
                            backgroundColor: "var(--app-bg)",
                            border: "1px solid var(--app-border)",
                            color: "var(--app-text-muted)",
                          }
                    }
                    data-ocid="create_post.toggle"
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hashtag suggest button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSuggestHashtags}
            disabled={hashtagLoading || !caption.trim()}
            className="self-start gap-2"
            style={{ borderColor: "#c44dff", color: "#7c3aed" }}
            data-ocid="create_post.suggest_hashtags_button"
          >
            {hashtagLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {hashtagLoading ? "Suggest हो रहे हैं..." : "✨ Hashtags Suggest करें"}
          </Button>

          {hashtagError && (
            <p
              className="text-xs text-red-400"
              data-ocid="create_post.error_state"
            >
              {hashtagError}
            </p>
          )}

          {/* Hashtag chips */}
          {suggestedHashtags.length > 0 && (
            <div className="flex flex-col gap-2">
              <p
                className="text-xs font-medium"
                style={{ color: "var(--app-text-muted)" }}
              >
                👆 Tap करें — caption में जुड़ जाएगा
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAppendHashtag(tag)}
                    className="px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,107,157,0.15), rgba(196,77,255,0.15))",
                      border: "1px solid rgba(196,77,255,0.4)",
                      color: "#7c3aed",
                    }}
                    data-ocid="create_post.toggle"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Post button */}
          <Button
            type="button"
            onClick={handlePost}
            disabled={!caption.trim()}
            className="w-full font-semibold text-white mt-1"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #f97316)",
              border: "none",
            }}
            data-ocid="create_post.submit_button"
          >
            Post Share करें
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── USER PROFILE MODAL ────────────────────────────────────────────────────────

function UserProfileModal({
  user,
  posts,
  stories,
  followedUsers,
  allUsers,
  onToggleFollow,
  onClose,
  onOpenStory,
  onMessage,
}: {
  user: AppUser;
  posts: Post[];
  stories: Story[];
  followedUsers: Set<number>;
  allUsers: AppUser[];
  onToggleFollow: (id: number) => void;
  onClose: () => void;
  onOpenStory: (story: Story) => void;
  onMessage?: (userId: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [localLiked, setLocalLiked] = useState<Set<number>>(new Set());
  const [localBookmarked, setLocalBookmarked] = useState<Set<number>>(
    new Set(),
  );
  const [showProfileShareModal, setShowProfileShareModal] = useState(false);
  const [showUserFollowersModal, setShowUserFollowersModal] = useState(false);
  const [showUserFollowingModal, setShowUserFollowingModal] = useState(false);
  const [userFollowersSearch, setUserFollowersSearch] = useState("");
  const [userFollowingSearch, setUserFollowingSearch] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // Compute mutual followers: users that current user follows AND also follow the viewed user
  // We simulate this with mock follower data based on USERS array
  const mutualFollowers = allUsers
    .filter((u) => u.id !== user.id && followedUsers.has(u.id))
    .slice(0, 5);

  const userPosts = posts.filter(
    (p) => p.user.id === user.id && (!p.type || p.type === "image"),
  );
  const userReels = posts.filter(
    (p) => p.user.id === user.id && p.type === "reel",
  );
  const displayedPosts = activeTab === "posts" ? userPosts : userReels;

  const userStory = stories.find(
    (s) => s.user.id === user.id && !s.isCurrentUser,
  );
  const isFollowing = followedUsers.has(user.id);

  function handleLikePost(postId: number) {
    setLocalLiked((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  async function handleDownloadPost(imageUrl: string) {
    try {
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = "connectly-post.jpg";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloading... ⬇️");
    } catch {
      toast.error("Download failed");
    }
  }
  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex flex-col"
        style={{ backgroundColor: "var(--app-bg)" }}
        data-ocid="user_profile_modal"
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{
            backgroundColor: "var(--app-card)",
            borderColor: "var(--app-border)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 active:opacity-70 transition-opacity"
            style={{ color: "var(--app-text)" }}
            data-ocid="user_profile_modal.back_button"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--app-text)" }}
          >
            @{user.username}
          </p>
          <div className="w-16 flex justify-end relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu((v) => !v)}
              className="p-2 rounded-full active:opacity-70 transition-opacity"
              style={{ color: "var(--app-text)" }}
              data-ocid="user_profile.more_options_button"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setShowMoreMenu(false)}
                />
                <div
                  className="absolute right-0 top-10 z-20 rounded-xl shadow-lg border overflow-hidden min-w-[160px]"
                  style={{
                    backgroundColor: "var(--app-card)",
                    borderColor: "var(--app-border)",
                  }}
                  data-ocid="user_profile.dropdown_menu"
                >
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:opacity-80 transition-opacity"
                    style={{ color: isBlocked ? "#22c55e" : "#ef4444" }}
                    onClick={() => {
                      setIsBlocked((v) => !v);
                      toast(
                        isBlocked
                          ? "User unblocked."
                          : "User blocked. You won't see their content.",
                      );
                      setShowMoreMenu(false);
                    }}
                    data-ocid="user_profile.block_button"
                  >
                    <span>{isBlocked ? "✅" : "🚫"}</span>
                    <span>{isBlocked ? "Unblock" : "Block"}</span>
                  </button>
                  <div
                    style={{ height: 1, backgroundColor: "var(--app-border)" }}
                  />
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:opacity-80 transition-opacity"
                    style={{ color: "#f59e0b" }}
                    onClick={() => {
                      toast("Report submitted. We'll review this account.");
                      setShowMoreMenu(false);
                    }}
                    data-ocid="user_profile.report_button"
                  >
                    <span>🚩</span>
                    <span>Report</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Blocked banner */}
          {isBlocked && (
            <div
              className="mx-4 mt-3 px-4 py-3 rounded-xl flex items-center justify-between gap-3"
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fca5a5",
              }}
              data-ocid="user_profile.blocked_banner"
            >
              <span className="text-sm text-red-600">
                🚫 You have blocked this user.
              </span>
              <button
                type="button"
                className="text-xs font-semibold text-red-600 underline"
                onClick={() => {
                  setIsBlocked(false);
                  toast("User unblocked.");
                }}
                data-ocid="user_profile.unblock_button"
              >
                Unblock
              </button>
            </div>
          )}
          {/* Profile header */}
          <div
            className="px-4 pt-5 pb-4"
            style={{ backgroundColor: "var(--app-card)" }}
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar with story ring */}
              <button
                type="button"
                onClick={() => userStory && onOpenStory(userStory)}
                className={userStory ? "cursor-pointer" : "cursor-default"}
              >
                {userStory ? (
                  <div
                    style={{
                      background:
                        "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                      padding: 2.5,
                      borderRadius: "50%",
                    }}
                  >
                    <div className="bg-background rounded-full p-[2px]">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xl">
                          {user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ) : (
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xl">
                      {user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
              </button>

              {/* Stats */}
              <div className="flex-1 pt-2">
                <div className="flex justify-around mb-3">
                  <div className="flex flex-col items-center">
                    <span
                      className="text-base font-bold"
                      style={{ color: "var(--app-text)" }}
                    >
                      {formatCount(user.posts)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      Posts
                    </span>
                  </div>
                  <button
                    type="button"
                    className="flex flex-col items-center hover:opacity-70 transition-opacity"
                    onClick={() => setShowUserFollowersModal(true)}
                    data-ocid="user_profile_modal.followers_button"
                  >
                    <span
                      className="text-base font-bold"
                      style={{ color: "var(--app-text)" }}
                    >
                      {formatCount(user.followers)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      Followers
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center hover:opacity-70 transition-opacity"
                    onClick={() => setShowUserFollowingModal(true)}
                    data-ocid="user_profile_modal.following_button"
                  >
                    <span
                      className="text-base font-bold"
                      style={{ color: "var(--app-text)" }}
                    >
                      {formatCount(user.following)}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      Following
                    </span>
                  </button>
                </div>

                {/* Follow + Message buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 rounded-lg text-sm font-semibold h-9"
                    style={{
                      backgroundColor: isFollowing
                        ? "var(--app-card)"
                        : "var(--app-accent)",
                      color: isFollowing ? "var(--app-text)" : "#fff",
                      border: isFollowing
                        ? "1px solid var(--app-border)"
                        : "none",
                    }}
                    onClick={() => onToggleFollow(user.id)}
                    data-ocid="user_profile_modal.toggle"
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-lg text-sm font-semibold h-9 gap-1.5"
                    style={{
                      borderColor: "var(--app-border)",
                      color: "var(--app-text)",
                    }}
                    onClick={() => onMessage?.(user.id)}
                    data-ocid="user_profile_modal.message_button"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Name + bio */}
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--app-text)" }}
              >
                {user.name}
              </p>
              {user.bio && (
                <p
                  className="text-sm mt-0.5 leading-relaxed"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {user.bio}
                </p>
              )}
            </div>

            {/* Mutual Followers */}
            {mutualFollowers.length > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-2">
                  {mutualFollowers.slice(0, 3).map((mu) => (
                    <Avatar
                      key={mu.id}
                      className="w-5 h-5 border-2"
                      style={{ borderColor: "var(--app-card)" }}
                    >
                      <AvatarImage src={mu.avatar} alt={mu.name} />
                      <AvatarFallback className="text-[8px]">
                        {mu.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p
                  className="text-xs"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  Followed by{" "}
                  <span
                    className="font-semibold"
                    style={{ color: "var(--app-text)" }}
                  >
                    {mutualFollowers[0].username}
                  </span>
                  {mutualFollowers.length > 1 && (
                    <>
                      {" "}
                      and{" "}
                      <span
                        className="font-semibold"
                        style={{ color: "var(--app-text)" }}
                      >
                        {mutualFollowers.length - 1} other
                        {mutualFollowers.length - 1 > 1 ? "s" : ""}
                      </span>
                    </>
                  )}{" "}
                  you follow
                </p>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div
            className="flex border-b sticky top-0 z-10"
            style={{
              backgroundColor: "var(--app-card)",
              borderColor: "var(--app-border)",
            }}
          >
            {(["posts", "reels"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-sm font-medium transition-colors"
                style={{
                  color:
                    activeTab === tab
                      ? "var(--app-accent)"
                      : "var(--app-text-muted)",
                  borderBottom:
                    activeTab === tab
                      ? "2px solid var(--app-accent)"
                      : "2px solid transparent",
                }}
                data-ocid={`user_profile_modal.${tab}.tab`}
              >
                {tab === "posts" ? "📷 Posts" : "🎬 Reels"}
              </button>
            ))}
          </div>

          {/* Grid */}
          {displayedPosts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 gap-3"
              style={{ color: "var(--app-text-muted)" }}
              data-ocid="user_profile_modal.empty_state"
            >
              {activeTab === "posts" ? (
                <Camera className="w-12 h-12 opacity-30" />
              ) : (
                <Play className="w-12 h-12 opacity-30" />
              )}
              <p className="text-sm">No {activeTab} yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 p-0.5">
              {displayedPosts.map((post, idx) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="relative aspect-square overflow-hidden active:opacity-80 transition-opacity"
                  data-ocid={`user_profile_modal.post.${idx + 1}`}
                >
                  {post.type === "reel" && post.videoUrl ? (
                    <video
                      src={post.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-150 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity flex items-center gap-3 text-white">
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        <Heart className="w-4 h-4 fill-white" />{" "}
                        {formatCount(post.likes)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold">
                        <MessageCircle className="w-4 h-4 fill-white" />{" "}
                        {post.comments}
                      </span>
                    </div>
                  </div>
                  {post.type === "reel" && (
                    <div className="absolute top-1.5 right-1.5">
                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Post detail dialog */}
        {selectedPost && (
          <div
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPost(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelectedPost(null);
            }}
          >
            <div
              className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden"
              style={{ backgroundColor: "var(--app-card)", maxHeight: "90vh" }}
            >
              {/* Close bar */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--app-border)" }}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--app-text)" }}
                  >
                    {user.username}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="p-1 rounded-full hover:bg-muted"
                  style={{ color: "var(--app-text-muted)" }}
                  data-ocid="user_profile_modal.close_button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Image/video */}
              <div className="aspect-square w-full overflow-hidden bg-black">
                {selectedPost.type === "reel" && selectedPost.videoUrl ? (
                  <video
                    src={selectedPost.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={selectedPost.image}
                    alt={selectedPost.caption}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Actions */}
              <div
                className="px-4 py-3 overflow-y-auto"
                style={{ maxHeight: "40vh" }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <button
                    type="button"
                    onClick={() => handleLikePost(selectedPost.id)}
                    className="flex items-center gap-1.5 active:scale-90 transition-transform"
                  >
                    <Heart
                      className="w-6 h-6 transition-colors"
                      style={{
                        color:
                          localLiked.has(selectedPost.id) ||
                          selectedPost.isLiked
                            ? "#E53935"
                            : "var(--app-text-muted)",
                        fill:
                          localLiked.has(selectedPost.id) ||
                          selectedPost.isLiked
                            ? "#E53935"
                            : "none",
                      }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--app-text)" }}
                    >
                      {formatCount(
                        selectedPost.likes +
                          (localLiked.has(selectedPost.id) ? 1 : 0),
                      )}
                    </span>
                  </button>
                  <button type="button" className="flex items-center gap-1.5">
                    <MessageCircle
                      className="w-6 h-6"
                      style={{ color: "var(--app-text-muted)" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--app-text)" }}
                    >
                      {selectedPost.comments}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="active:scale-90 transition-transform"
                    onClick={() => {
                      const wasBookmarked = localBookmarked.has(
                        selectedPost.id,
                      );
                      setLocalBookmarked((prev) => {
                        const next = new Set(prev);
                        if (next.has(selectedPost.id))
                          next.delete(selectedPost.id);
                        else next.add(selectedPost.id);
                        return next;
                      });
                      if (!wasBookmarked) {
                        toast.success("Post saved! 🔖");
                      } else {
                        toast.success("Post unsaved");
                      }
                    }}
                    data-ocid="post_detail.bookmark_button"
                  >
                    <Bookmark
                      className="w-6 h-6"
                      style={{
                        color: localBookmarked.has(selectedPost.id)
                          ? "#FACC15"
                          : "var(--app-text-muted)",
                        fill: localBookmarked.has(selectedPost.id)
                          ? "#FACC15"
                          : "none",
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    className="active:scale-90 transition-transform"
                    onClick={() => handleDownloadPost(selectedPost.image)}
                    data-ocid="post_detail.download_button"
                  >
                    <Download
                      className="w-6 h-6"
                      style={{ color: "var(--app-text-muted)" }}
                    />
                  </button>
                  <button
                    type="button"
                    className="ml-auto"
                    onClick={() => setShowProfileShareModal(true)}
                    data-ocid="user_profile_modal.secondary_button"
                  >
                    <Share2
                      className="w-6 h-6"
                      style={{ color: "var(--app-text-muted)" }}
                    />
                  </button>
                </div>
                <p
                  className="text-sm mb-1"
                  style={{ color: "var(--app-text)" }}
                >
                  <span className="font-semibold mr-1">{user.username}</span>
                  {selectedPost.caption}
                </p>
                {(selectedPost.commentList ?? []).slice(0, 3).map((c) => (
                  <p
                    key={c.id}
                    className="text-sm mb-0.5"
                    style={{ color: "var(--app-text-muted)" }}
                  >
                    <span
                      className="font-semibold mr-1"
                      style={{ color: "var(--app-text)" }}
                    >
                      {c.username}
                    </span>
                    {c.text}
                  </p>
                ))}
                <div
                  className="flex gap-2 mt-3 border-t pt-3"
                  style={{ borderColor: "var(--app-border)" }}
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentInput.trim()) {
                        toast.success("Comment added!");
                        setCommentInput("");
                      }
                    }}
                    className="flex-1 text-sm bg-transparent outline-none"
                    style={{ color: "var(--app-text)" }}
                    data-ocid="user_profile_modal.input"
                  />
                  {commentInput.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.success("Comment added!");
                        setCommentInput("");
                      }}
                      className="text-sm font-semibold"
                      style={{ color: "var(--app-accent)" }}
                      data-ocid="user_profile_modal.submit_button"
                    >
                      Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Dialog
        open={showUserFollowersModal}
        onOpenChange={setShowUserFollowersModal}
      >
        <DialogContent className="max-w-sm max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="relative mb-1">
            <input
              type="text"
              placeholder="Search followers..."
              value={userFollowersSearch}
              onChange={(e) => setUserFollowersSearch(e.target.value)}
              className="w-full px-3 py-2 pl-8 text-sm rounded-lg border border-border bg-background outline-none"
              style={{ color: "var(--app-text)" }}
            />
            <svg
              aria-label="Search"
              role="img"
              className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Search</title>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scroll-smooth pb-2">
            {USERS.slice(0, 6)
              .filter(
                (u) =>
                  userFollowersSearch === "" ||
                  u.name
                    .toLowerCase()
                    .includes(userFollowersSearch.toLowerCase()) ||
                  u.username
                    .toLowerCase()
                    .includes(userFollowersSearch.toLowerCase()),
              )
              .map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--app-text)" }}
                    >
                      {u.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      @{u.username}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={followedUsers.has(u.id) ? "outline" : "default"}
                    className="text-xs h-7 px-3"
                    onClick={() => onToggleFollow(u.id)}
                  >
                    {followedUsers.has(u.id) ? "Following" : "Follow"}
                  </Button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showUserFollowingModal}
        onOpenChange={setShowUserFollowingModal}
      >
        <DialogContent className="max-w-sm max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <div className="relative mb-1">
            <input
              type="text"
              placeholder="Search following..."
              value={userFollowingSearch}
              onChange={(e) => setUserFollowingSearch(e.target.value)}
              className="w-full px-3 py-2 pl-8 text-sm rounded-lg border border-border bg-background outline-none"
              style={{ color: "var(--app-text)" }}
            />
            <svg
              aria-label="Search"
              role="img"
              className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Search</title>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div className="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1 scroll-smooth pb-2">
            {USERS.filter(
              (u) =>
                followedUsers.has(u.id) &&
                (userFollowingSearch === "" ||
                  u.name
                    .toLowerCase()
                    .includes(userFollowingSearch.toLowerCase()) ||
                  u.username
                    .toLowerCase()
                    .includes(userFollowingSearch.toLowerCase())),
            ).length === 0 ? (
              <p
                className="text-sm text-center py-4"
                style={{ color: "var(--app-text-muted)" }}
              >
                No following yet.
              </p>
            ) : (
              USERS.filter(
                (u) =>
                  followedUsers.has(u.id) &&
                  (userFollowingSearch === "" ||
                    u.name
                      .toLowerCase()
                      .includes(userFollowingSearch.toLowerCase()) ||
                    u.username
                      .toLowerCase()
                      .includes(userFollowingSearch.toLowerCase())),
              ).map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--app-text)" }}
                    >
                      {u.name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      @{u.username}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-3"
                    onClick={() => onToggleFollow(u.id)}
                  >
                    Following
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      <GlobalShareSheet
        open={showProfileShareModal}
        onClose={() => setShowProfileShareModal(false)}
        title={`Check out @${user.username}'s profile on Connectly!`}
        url={window.location.href}
      />
    </>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(true);
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(
    new Set([1, 3, 5]),
  );
  const [posts, setPosts] = useState<Post[]>(POSTS_INITIAL);
  const { profile, updateProfile } = useProfile();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [chatInitUserId, setChatInitUserId] = useState<number | null>(null);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>(STORIES_INITIAL);
  const [notifications, setNotifications] =
    useState<Notification[]>(NOTIFICATIONS);
  const [toastNotif, setToastNotif] = useState<Notification | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [viewingUser, setViewingUser] = useState<AppUser | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");

  function handleOpenUserProfile(user: AppUser) {
    if (user.username === profile.username || user.id === CURRENT_USER.id) {
      setActivePage("profile");
      return;
    }
    setViewingUser(user);
  }

  function handleAddStory(data: {
    image?: string;
    caption?: string;
    mentions: string[];
  }) {
    const newStory: Story = {
      id: Date.now(),
      user: CURRENT_USER,
      isCurrentUser: true,
      seen: false,
      ...data,
    };
    setStories((prev) => [prev[0], newStory, ...prev.slice(1)]);
    // Add mention notifications
    if (data.mentions.length > 0) {
      const mentionNotifs: Notification[] = data.mentions.map((username, i) => {
        const mentionedUser = USERS.find((u) => u.username === username);
        return {
          id: Date.now() + i + 1,
          user: CURRENT_USER,
          type: "mention" as const,
          text: `mentioned @${username} in their story`,
          time: "just now",
          read: false,
          ...(mentionedUser ? {} : {}),
        };
      });
      setNotifications((prev) => [...mentionNotifs, ...prev]);
    }
  }

  function handleAddPost(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleComment(id: number, text: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: p.comments + 1,
              commentList: [
                ...(p.commentList ?? []),
                { id: Date.now(), text, username: profile.username },
              ],
            }
          : p,
      ),
    );
  }

  function handleLike(id: number) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isLiked: !p.isLiked } : p)),
    );
  }
  function handleBookmark(id: number) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p,
      ),
    );
  }
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { tradUser, tradLogin, tradSignup, tradLogout, tradError } =
    useTraditionalAuth();

  const isLoggedIn = !!identity || !!tradUser;
  const [showLanding, setShowLanding] = useState(true);
  const combinedPrincipal =
    identity?.getPrincipal().toText() ?? tradUser?.principalId;
  const loginMethod: "internet-identity" | "email" = identity
    ? "internet-identity"
    : "email";
  function combinedLogout() {
    clear();
    tradLogout();
  }

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [darkMode]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (showToast && activePage !== "notifications") {
      const t = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showToast, activePage]);

  function renderPage() {
    switch (activePage) {
      case "home":
        return (
          <HomePage
            posts={posts}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onComment={handleComment}
            stories={stories}
            onAddStory={handleAddStory}
            followedUsers={followedUsers}
            onOpenUserProfile={handleOpenUserProfile}
            onToggleFollow={(id) =>
              setFollowedUsers((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
          />
        );
      case "search":
        return (
          <SearchPage
            followedUsers={followedUsers}
            setFollowedUsers={setFollowedUsers}
            stories={stories}
            onOpenUserProfile={handleOpenUserProfile}
          />
        );
      case "reels":
        return (
          <ReelsPage
            userReels={posts.filter((p) => p.type === "reel")}
            followedUsers={followedUsers}
            setFollowedUsers={setFollowedUsers}
            onOpenUserProfile={handleOpenUserProfile}
          />
        );
      case "notifications":
        return (
          <NotificationsPage
            notifications={notifications}
            setNotifications={setNotifications}
            onNewNotif={(n) => {
              setToastNotif(n);
              setShowToast(true);
            }}
            followedUsers={followedUsers}
            setFollowedUsers={setFollowedUsers}
            onOpenUserProfile={handleOpenUserProfile}
          />
        );
      case "chat":
        return (
          <ChatPage
            initialUserId={chatInitUserId}
            onConvOpened={() => setChatInitUserId(null)}
          />
        );
      case "profile":
        return (
          <ProfilePage
            darkMode={darkMode}
            onToggleDark={() => setDarkMode((d) => !d)}
            principal={combinedPrincipal}
            loginMethod={loginMethod}
            onLogout={combinedLogout}
            profile={profile}
            onEditProfile={() => setEditProfileOpen(true)}
            followedUsers={followedUsers}
            posts={posts}
            onBookmark={handleBookmark}
            onToggleFollow={(id) =>
              setFollowedUsers((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
          />
        );
      case "ai":
        return (
          <AIStudioPage
            isPremium={isPremium}
            onUpgrade={(feat) => {
              setUpgradeFeature(feat);
              setShowUpgradeModal(true);
            }}
          />
        );
      default:
        return (
          <HomePage
            posts={posts}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onComment={handleComment}
            stories={stories}
            onAddStory={handleAddStory}
            followedUsers={followedUsers}
            onToggleFollow={(id) =>
              setFollowedUsers((prev) => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
              })
            }
          />
        );
    }
  }

  // Loading state
  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: "var(--app-bg)" }}
        data-ocid="login.loading_state"
      >
        <h1
          className="text-3xl font-extrabold"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Connectly
        </h1>
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#7c3aed" }}
        />
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    if (showLanding) {
      return <LandingPage onGetStarted={() => setShowLanding(false)} />;
    }
    return (
      <LoginScreen
        onLogin={login}
        isLoggingIn={isLoggingIn}
        onTradLogin={tradLogin}
        onTradSignup={tradSignup}
        tradError={tradError}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--app-bg)" }}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        notifCount={unreadNotifications}
        onCreatePost={() => setCreatePostOpen(true)}
      />
      <BottomNav
        activePage={activePage}
        onNavigate={setActivePage}
        notifCount={unreadNotifications}
        onCreatePost={() => setCreatePostOpen(true)}
      />

      {/* Main layout */}
      <div className="md:pl-[240px]">
        <div className="max-w-[1100px] mx-auto px-4 py-6">
          <div className="flex gap-8">
            {/* Center content */}
            <main className="flex-1 min-w-0">
              {/* Mobile header */}
              <div className="md:hidden flex items-center justify-between mb-4 py-2">
                <h1
                  className="text-xl font-extrabold"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Connectly
                </h1>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePage("chat")}
                    className="relative p-2 rounded-full hover:bg-muted"
                    data-ocid="nav.chat.link"
                  >
                    <MessageCircle
                      className="w-6 h-6"
                      style={{ color: "var(--app-text)" }}
                    />
                  </button>
                </div>
              </div>
              {renderPage()}
            </main>

            {/* Right sidebar - only on home */}
            {activePage === "home" && (
              <RightSidebar onNavigate={setActivePage} profile={profile} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav spacing */}
      <div className="md:hidden h-16" />

      <CreatePostDialog
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPost={handleAddPost}
        profile={profile}
      />
      <EditProfileDialog
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        profile={profile}
        onSave={updateProfile}
      />
      {viewingUser && (
        <UserProfileModal
          user={viewingUser}
          posts={posts}
          stories={stories}
          followedUsers={followedUsers}
          allUsers={USERS}
          onToggleFollow={(id) =>
            setFollowedUsers((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })
          }
          onClose={() => setViewingUser(null)}
          onOpenStory={(_story) => {
            setViewingUser(null);
          }}
          onMessage={(userId) => {
            setViewingUser(null);
            setChatInitUserId(userId);
            setActivePage("chat");
          }}
        />
      )}
      {/* Real-time Notification Toast */}
      {showToast && activePage !== "notifications" && toastNotif && (
        <div
          className="fixed top-4 left-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
          style={{
            transform: "translateX(-50%)",
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
            animation: "slideDownIn 0.3s ease",
            maxWidth: "340px",
            width: "90vw",
          }}
          data-ocid="notifications.toast"
        >
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage
              src={toastNotif.user.avatar}
              alt={toastNotif.user.name}
            />
            <AvatarFallback>{toastNotif.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: "var(--app-text)" }}>
              <span className="font-semibold">{toastNotif.user.name}</span>{" "}
              {toastNotif.text}
            </p>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              just now
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="flex-shrink-0 p-1 rounded-full hover:bg-muted"
            style={{ color: "var(--app-text-muted)" }}
            data-ocid="notifications.toast.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          data-ocid="upgrade.modal"
        >
          <div
            className="w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
          >
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
                style={{ background: "var(--app-gradient)" }}
              >
                ✨
              </div>
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: "var(--app-text)" }}
              >
                Upgrade to Connectly+
              </h2>
              <p
                className="text-2xl font-extrabold"
                style={{
                  background: "var(--app-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                $5/month
              </p>
            </div>
            {upgradeFeature && (
              <p
                className="text-xs text-center mb-4 px-3 py-2 rounded-xl"
                style={{
                  backgroundColor: "var(--app-border)",
                  color: "var(--app-text-muted)",
                }}
              >
                🔒 {upgradeFeature}
              </p>
            )}
            <ul className="space-y-2.5 mb-6">
              {[
                "Ad-free experience",
                "Full AI Studio access",
                "Verified badge ✓",
                "Exclusive themes",
                "Priority support",
              ].map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--app-text)" }}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: "var(--app-gradient)" }}
                  >
                    ✓
                  </span>
                  {b}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="w-full py-3 rounded-2xl text-white font-bold text-sm mb-2"
              style={{ background: "var(--app-gradient)" }}
              onClick={() => {
                setIsPremium(true);
                setShowUpgradeModal(false);
                toast.success("Welcome to Connectly+ ✨");
              }}
              data-ocid="upgrade.confirm_button"
            >
              Upgrade Now — $5/month
            </button>
            <button
              type="button"
              className="w-full py-2 rounded-2xl text-sm font-medium"
              style={{ color: "var(--app-text-muted)" }}
              onClick={() => setShowUpgradeModal(false)}
              data-ocid="upgrade.cancel_button"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
