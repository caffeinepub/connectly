import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Hash,
  Heart,
  Home,
  Loader2,
  LogOut,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Music,
  Play,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  Smile,
  Sparkles,
  Sun,
  User as UserIcon,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setName(profile.name);
      setUsername(profile.username);
      setBio(profile.bio);
      setAvatar(profile.avatar);
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

  function handleSave() {
    onSave({ name, username, bio, avatar });
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

        <div className="flex flex-col gap-4 mt-2">
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
              Bio
            </label>
            <Textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 150))}
              placeholder="Tell something about yourself..."
              rows={3}
              className="rounded-lg resize-none"
              data-ocid="edit_profile.textarea"
            />
            <p
              className="text-xs text-right"
              style={{ color: "var(--app-text-muted)" }}
            >
              {bio.length}/150
            </p>
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
                background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
              background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
  const [shareCopied, setShareCopied] = useState(false);
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
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
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
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40"
            data-ocid="story.close_button"
          >
            <X className="w-5 h-5 text-white" />
          </button>
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
            <span className="text-white text-xs">
              {shareCopied ? "Copied!" : "Share"}
            </span>
          </button>
        </div>
      </div>
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
    brand: "Nike",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Nike&backgroundColor=111111&fontColor=ffffff",
    tagline: "Just Do It. Air Max 2025 — Drop Now.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ctaLabel: "Shop Now",
    ctaUrl: "https://nike.com",
  },
  {
    id: "ad2",
    brand: "Apple",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Apple&backgroundColor=1c1c1e&fontColor=ffffff",
    tagline: "iPhone 16 Pro. Shot on iPhone. Made for you.",
    image:
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=800&q=80",
    ctaLabel: "Learn More",
    ctaUrl: "https://apple.com",
  },
  {
    id: "ad3",
    brand: "Adidas",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Adidas&backgroundColor=000000&fontColor=ffffff",
    tagline: "Impossible is Nothing. New Ultraboost 25.",
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ctaLabel: "Buy Now",
    ctaUrl: "https://adidas.com",
  },
  {
    id: "ad4",
    brand: "Samsung",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Samsung&backgroundColor=1428a0&fontColor=ffffff",
    tagline: "Galaxy S25 Ultra. The AI phone of the future.",
    image:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80",
    ctaLabel: "Explore",
    ctaUrl: "https://samsung.com",
  },
  {
    id: "ad5",
    brand: "Zara",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Zara&backgroundColor=222222&fontColor=ffffff",
    tagline: "New Season arrivals. Style that speaks.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    ctaLabel: "Shop Collection",
    ctaUrl: "https://zara.com",
  },
  {
    id: "ad6",
    brand: "Spotify",
    brandAvatar:
      "https://api.dicebear.com/7.x/initials/svg?seed=Spotify&backgroundColor=1db954&fontColor=ffffff",
    tagline: "Your music. Your podcasts. All in one place.",
    image:
      "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80",
    ctaLabel: "Try Free",
    ctaUrl: "https://spotify.com",
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
              Sponsored
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

// PostCard
function PostCard({
  post,
  onLike,
  onBookmark,
  onComment,
}: {
  post: Post;
  onLike: (id: number) => void;
  onBookmark: (id: number) => void;
  onComment: (id: number, text: string) => void;
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

  function handleLike() {
    setLikeScale(true);
    onLike(post.id);
    setTimeout(() => setLikeScale(false), 200);
  }

  function handleShare() {
    toast.success("Post shared! 📤");
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
        <div className="flex items-center gap-3">
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
        </div>
        <button
          type="button"
          className="p-1 rounded-full hover:bg-muted active:scale-95 transition-transform duration-150"
          style={{ color: "var(--app-text-muted)" }}
          data-ocid={`feed.item.${post.id}.button`}
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
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
                      <div key={r.id} className="flex gap-1.5 items-start">
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
                        background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
                  background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
                }}
                data-ocid={`feed.item.${post.id}.submit_button`}
              >
                Post
              </button>
            </div>
          </div>
        )}
      </div>
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
}) {
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);

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
        {posts.flatMap((post, i) => {
          const cards = [
            <PostCard
              key={post.id}
              post={post}
              onLike={onLike}
              onBookmark={onBookmark}
              onComment={onComment}
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
    </div>
  );
}

// ─── SEARCH PAGE ──────────────────────────────────────────────────────────────

function SearchPage({
  followedUsers,
  setFollowedUsers,
}: {
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"top" | "people" | "tags">("top");
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
  } | null>(null);
  const [lightboxComment, setLightboxComment] = useState("");

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
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--app-text)" }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      @{user.username} · {formatCount(user.followers)} followers
                    </p>
                  </div>
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
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--app-accent)",
                    color: "#fff",
                  }}
                  data-ocid="search.button"
                >
                  Follow
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
                onClick={() => {
                  toast.success("Link copied!");
                }}
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
    </div>
  );
}

// ─── REELS PAGE ───────────────────────────────────────────────────────────────

function ReelsPage({ userReels }: { userReels?: Post[] }) {
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
  const [reelComments, setReelComments] = useState<Record<number, string[]>>({
    1: ["Love the energy! 🔥", "This is so inspiring!", "Goals 💪"],
    2: ["Paradise found 🌴", "I need to go here!", "So beautiful 😍"],
    3: ["Stunning view! ⛰️", "Nature at its best", "Breathtaking 🌅"],
    4: ["Amazing skills!", "Tutorial please?", "🙌🙌🙌"],
    5: ["Made this at home!", "Recipe please 🍕", "Looks delicious!"],
  });
  const [commentInput, setCommentInput] = useState("");
  const [doubleTapId, setDoubleTapId] = useState<number | null>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef<Record<number, number>>({});

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

  function handleShare() {
    toast.success("Reel shared! 📤");
  }

  function handleTap(reelId: number) {
    const now = Date.now();
    const last = lastTapRef.current[reelId] ?? 0;
    if (now - last < 300) {
      handleLike(reelId);
      setDoubleTapId(reelId);
      setTimeout(() => setDoubleTapId(null), 600);
    }
    lastTapRef.current[reelId] = now;
  }

  function handleSendComment() {
    if (!commentInput.trim() || commentReelId === null) return;
    setReelComments((prev) => ({
      ...prev,
      [commentReelId]: [...(prev[commentReelId] ?? []), commentInput.trim()],
    }));
    setReelComments((prev) => prev);
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
      <div className="reels-fullscreen-container" data-ocid="reels.page">
        {reels.map((reel, i) => (
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
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-9 h-9 border-2 border-white">
                  <AvatarImage src={reel.user.avatar} alt={reel.user.name} />
                  <AvatarFallback>{reel.user.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-white text-sm font-semibold">
                  {reel.user.username}
                </span>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="border border-white text-white text-xs px-3 py-0.5 rounded-full pointer-events-auto"
                  data-ocid={`reels.item.${i + 1}.button`}
                >
                  Follow
                </button>
              </div>
              <p className="text-white text-sm">{reel.caption}</p>
              <div className="flex items-center gap-1 mt-2 text-white/80 text-xs">
                <Music className="w-3 h-3" />
                <span>Original Audio • {reel.user.name}</span>
              </div>
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
                  handleShare();
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
            </div>
          </div>
        ))}
      </div>

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
              {(reelComments[commentReelId] ?? []).map((c, idx) => (
                <div
                  key={`comment-${idx}-${c.slice(0, 5)}`}
                  className="flex items-start gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-violet-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold dark:text-white">
                      user_{idx + 1}{" "}
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-300">
                      {c}
                    </span>
                  </div>
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
            <div className="flex items-center gap-2 border-t dark:border-zinc-700 pt-3">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
                placeholder="Add a comment..."
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
}: {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  onNewNotif?: (n: Notification) => void;
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
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
}: {
  notification: Notification;
  index: number;
  isNew?: boolean;
  followedUsers: Set<number>;
  setFollowedUsers: React.Dispatch<React.SetStateAction<Set<number>>>;
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
      <div className="relative flex-shrink-0">
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
      </div>
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

function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(
    CONVERSATIONS_INITIAL,
  );
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const filteredConversations = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function sendMessage() {
    if (!newMessage.trim() || !activeConvId) return;
    const text = newMessage.trim();
    setNewMessage("");

    const msg: Message = {
      id: Date.now(),
      text,
      sent: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reactions: [],
      read: false,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text }
          : c,
      ),
    );

    // simulate typing then auto-reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sent: false,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        reactions: [],
        read: true,
      };
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

  return (
    <div
      className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden border border-border"
      data-ocid="chat.panel"
    >
      {/* Conversation list */}
      <div
        className={`flex-shrink-0 w-full md:w-72 border-r border-border flex flex-col ${
          activeConv ? "hidden md:flex" : "flex"
        }`}
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
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors ${
                activeConvId === conv.id ? "bg-muted" : ""
              }`}
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
          className="flex-1 flex flex-col"
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
            <div>
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
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2"
            data-ocid="chat.list"
          >
            {activeConv.messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sent ? "items-end" : "items-start"}`}
                onMouseEnter={() => !msg.sent && setHoveredMsgId(msg.id)}
                onMouseLeave={() => setHoveredMsgId(null)}
                data-ocid={`chat.item.${i + 1}`}
              >
                {/* Reaction bar on hover */}
                {!msg.sent && hoveredMsgId === msg.id && (
                  <div
                    className="flex gap-1 mb-1 px-2 py-1 rounded-full shadow-lg border border-border"
                    style={{ backgroundColor: "var(--app-card)" }}
                  >
                    {["❤️", "😂", "👍"].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="text-sm hover:scale-125 transition-transform"
                        onClick={() => addReaction(msg.id, emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className="px-4 py-2 rounded-2xl text-sm max-w-[70%]"
                  style={{
                    background: msg.sent
                      ? "linear-gradient(135deg, #ff6b9d, #c44dff)"
                      : "var(--app-card)",
                    color: msg.sent ? "white" : "var(--app-text)",
                    borderBottomRightRadius: msg.sent ? 4 : undefined,
                    borderBottomLeftRadius: !msg.sent ? 4 : undefined,
                  }}
                >
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

          {/* Emoji quick bar */}
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

          {/* Input */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-t border-border"
            style={{ backgroundColor: "var(--app-card)" }}
          >
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
              className="rounded-full px-4 text-white"
              style={{
                background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
                border: "none",
              }}
              data-ocid="chat.submit_button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
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
}) {
  const [isPrivate, setIsPrivate] = useState(CURRENT_USER.isPrivate);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const profilePosts = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    image: `https://picsum.photos/seed/profile${i + 1}/300/300`,
  }));

  return (
    <div className="flex flex-col gap-6 pb-4" data-ocid="profile.page">
      {/* Header */}
      <div
        className="rounded-xl border border-border p-6"
        style={{ backgroundColor: "var(--app-card)" }}
      >
        <div className="flex items-start gap-5">
          <div className="relative">
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
            <p
              className="text-sm mt-1"
              style={{ color: "var(--app-text-muted)" }}
            >
              {profile.bio}
            </p>
            {principal && (
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg w-fit"
                  style={{ backgroundColor: "var(--app-card)" }}
                >
                  <Shield
                    className="w-3 h-3 flex-shrink-0"
                    style={{ color: "#c44dff" }}
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
                            color: "#c44dff",
                          }
                        : {
                            background: "rgba(255,107,157,0.15)",
                            color: "#ff6b9d",
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
            {/* Followers Modal */}
            <Dialog
              open={showFollowersModal}
              onOpenChange={setShowFollowersModal}
            >
              <DialogContent
                className="max-w-sm"
                data-ocid="profile.followers.dialog"
              >
                <DialogHeader>
                  <DialogTitle>Followers</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                  {USERS.slice(0, 6).map((u) => (
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
                className="max-w-sm"
                data-ocid="profile.following.dialog"
              >
                <DialogHeader>
                  <DialogTitle>Following</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
                  {USERS.filter((u) => followedUsers.has(u.id)).length === 0 ? (
                    <p
                      className="text-sm text-center py-4"
                      style={{ color: "var(--app-text-muted)" }}
                    >
                      You are not following anyone yet.
                    </p>
                  ) : (
                    USERS.filter((u) => followedUsers.has(u.id)).map((u) => (
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
      </div>

      {/* Posts Grid */}
      <div>
        <h2
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--app-text)" }}
        >
          Posts
        </h2>
        <div className="grid grid-cols-3 gap-1" data-ocid="profile.list">
          {profilePosts.map((post, i) => (
            <button
              type="button"
              key={post.id}
              className="relative aspect-square overflow-hidden rounded-lg group"
              data-ocid={`profile.item.${i + 1}`}
            >
              <img
                src={post.image}
                alt="post"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-150"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
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
            background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
        style={{ background: "linear-gradient(135deg, #ff6b9d, #c44dff)" }}
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
    { id: "ai" as Page, icon: <Sparkles className="w-6 h-6" /> },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around h-16 border-t border-border z-50"
      style={{ backgroundColor: "var(--app-nav)" }}
      data-ocid="nav.panel"
    >
      {items.slice(0, 2).map((item) => {
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
        style={{ background: "linear-gradient(135deg, #ff6b9d, #c44dff)" }}
        data-ocid="create_post.open_modal_button"
      >
        <Plus className="w-6 h-6" />
      </button>

      {items.slice(2).map((item) => {
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

function AIStudioPage() {
  const [writePrompt, setWritePrompt] = useState("");
  const [writeOutput, setWriteOutput] = useState("");
  const [writeLoading, setWriteLoading] = useState(false);
  const [writeError, setWriteError] = useState("");
  const [copied, setCopied] = useState(false);

  // Hashtag auto-suggest state
  const [captionInput, setCaptionInput] = useState("");
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [hashtagError, setHashtagError] = useState("");
  const [copiedHashtag, setCopiedHashtag] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const writeChips = [
    "Instagram caption",
    "Bio ideas",
    "Hashtags",
    "Story ideas",
    "Post ideas",
  ];

  async function handleGenerate() {
    if (!writePrompt.trim()) return;
    setWriteLoading(true);
    setWriteError("");
    setWriteOutput("");
    try {
      const res = await fetch(
        `https://text.pollinations.ai/${encodeURIComponent(writePrompt)}`,
      );
      if (!res.ok) throw new Error("Failed to generate");
      const text = await res.text();
      setWriteOutput(text);
    } catch {
      setWriteError("Generation failed. Please try again.");
    } finally {
      setWriteLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(writeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSuggestHashtags() {
    if (!captionInput.trim()) return;
    setHashtagLoading(true);
    setHashtagError("");
    setSuggestedHashtags([]);
    try {
      const prompt = `Generate 15 relevant Instagram hashtags for this caption: "${captionInput}". Return only the hashtags separated by spaces, no explanation, no numbering.`;
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
      setSuggestedHashtags(tokens.slice(0, 20));
    } catch {
      setHashtagError("Hashtags suggest नहीं हो सके। दोबारा try करें।");
    } finally {
      setHashtagLoading(false);
    }
  }

  async function handleCopyHashtag(tag: string) {
    await navigator.clipboard.writeText(tag);
    setCopiedHashtag(tag);
    setTimeout(() => setCopiedHashtag(null), 1500);
  }

  async function handleCopyAllHashtags() {
    await navigator.clipboard.writeText(suggestedHashtags.join(" "));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto pb-8" data-ocid="ai.page">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #ff6b9d, #c44dff)" }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1
            className="text-xl font-bold"
            style={{ color: "var(--app-text)" }}
          >
            AI Studio
          </h1>
          <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
            Powered by Pollinations AI
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {writeChips.map((chip) => (
            <button
              type="button"
              key={chip}
              onClick={() => setWritePrompt(chip)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:opacity-80"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text-muted)",
                backgroundColor: "var(--app-card)",
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <Textarea
          value={writePrompt}
          onChange={(e) => setWritePrompt(e.target.value)}
          placeholder="कोई भी prompt लिखो... e.g. Instagram caption for sunset photo"
          rows={4}
          className="resize-none rounded-xl border text-sm"
          style={{
            backgroundColor: "var(--app-card)",
            borderColor: "var(--app-border)",
            color: "var(--app-text)",
          }}
          data-ocid="ai.write.textarea"
        />

        <Button
          onClick={handleGenerate}
          disabled={writeLoading || !writePrompt.trim()}
          className="w-full h-11 rounded-xl font-semibold text-white"
          style={{
            background: writeLoading
              ? "var(--app-text-muted)"
              : "linear-gradient(135deg, #ff6b9d, #c44dff)",
            border: "none",
          }}
          data-ocid="ai.write.submit_button"
        >
          {writeLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        {writeError && (
          <div
            className="p-4 rounded-xl text-sm text-red-400"
            style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
            data-ocid="ai.write.error_state"
          >
            {writeError}
          </div>
        )}

        {writeOutput && (
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--app-card)",
              border: "1px solid var(--app-border)",
            }}
            data-ocid="ai.write.success_state"
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--app-text-muted)" }}
              >
                Generated Output
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  backgroundColor: copied
                    ? "rgba(34,197,94,0.15)"
                    : "var(--app-border)",
                  color: copied ? "#22c55e" : "var(--app-text-muted)",
                }}
                data-ocid="ai.write.button"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--app-text)" }}
            >
              {writeOutput}
            </p>
          </div>
        )}

        {/* Divider */}
        <div
          style={{ borderTop: "1px solid var(--app-border)", margin: "8px 0" }}
        />

        {/* Hashtag Auto-Suggest Section */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{
            backgroundColor: "var(--app-card)",
            border: "1px solid var(--app-border)",
          }}
          data-ocid="ai.hashtag.panel"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
              }}
            >
              <Hash className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2
                className="text-sm font-bold"
                style={{ color: "var(--app-text)" }}
              >
                Caption से Hashtags Suggest करें
              </h2>
              <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
                Caption paste करें — AI relevant hashtags suggest करेगा
              </p>
            </div>
          </div>

          <Textarea
            value={captionInput}
            onChange={(e) => setCaptionInput(e.target.value)}
            placeholder="यहाँ अपना caption लिखें या paste करें..."
            rows={3}
            className="resize-none rounded-xl border text-sm"
            style={{
              backgroundColor: "var(--app-bg)",
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
            data-ocid="ai.hashtag.textarea"
          />

          <Button
            onClick={handleSuggestHashtags}
            disabled={hashtagLoading || !captionInput.trim()}
            className="w-full h-11 rounded-xl font-semibold text-white"
            style={{
              background: hashtagLoading
                ? "var(--app-text-muted)"
                : "linear-gradient(135deg, #c44dff, #ff6b9d)",
              border: "none",
            }}
            data-ocid="ai.hashtag.submit_button"
          >
            {hashtagLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suggesting...
              </>
            ) : (
              <>
                <Hash className="mr-2 h-4 w-4" />
                Hashtags Suggest करें
              </>
            )}
          </Button>

          {hashtagError && (
            <div
              className="p-3 rounded-xl text-sm text-red-400"
              style={{ backgroundColor: "rgba(239,68,68,0.1)" }}
              data-ocid="ai.hashtag.error_state"
            >
              {hashtagError}
            </div>
          )}

          {suggestedHashtags.length > 0 && (
            <div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{
                backgroundColor: "var(--app-bg)",
                border: "1px solid var(--app-border)",
              }}
              data-ocid="ai.hashtag.success_state"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  {suggestedHashtags.length} hashtags — tap to copy
                </span>
                <button
                  type="button"
                  onClick={handleCopyAllHashtags}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: copiedAll
                      ? "rgba(34,197,94,0.15)"
                      : "linear-gradient(135deg, rgba(255,107,157,0.15), rgba(196,77,255,0.15))",
                    color: copiedAll ? "#22c55e" : "#c44dff",
                    border: `1px solid ${copiedAll ? "#22c55e" : "#c44dff"}`,
                  }}
                  data-ocid="ai.hashtag.button"
                >
                  <Copy className="w-3 h-3" />
                  {copiedAll ? "Copied!" : "Copy All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestedHashtags.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleCopyHashtag(tag)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105"
                    style={{
                      background:
                        copiedHashtag === tag
                          ? "rgba(34,197,94,0.15)"
                          : "linear-gradient(135deg, rgba(255,107,157,0.1), rgba(196,77,255,0.1))",
                      border: `1px solid ${copiedHashtag === tag ? "#22c55e" : "#c44dff"}`,
                      color: copiedHashtag === tag ? "#22c55e" : "#ff6b9d",
                    }}
                    data-ocid="ai.hashtag.item.1"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
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
            style={{ background: "linear-gradient(135deg, #ff6b9d, #c44dff)" }}
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
                background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
                      background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
                  : "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
                      ? { borderColor: "#c44dff", color: "#c44dff" }
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
                  background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  function resetState() {
    setPostType("image");
    setImageUrl("");
    setFilePreview("");
    setCaption("");
    setSuggestedHashtags([]);
    setHashtagError("");
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
                        background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
              rows={3}
              style={{
                backgroundColor: "var(--app-input)",
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
                resize: "none",
              }}
              data-ocid="create_post.textarea"
            />
          </div>

          {/* Hashtag suggest button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSuggestHashtags}
            disabled={hashtagLoading || !caption.trim()}
            className="self-start gap-2"
            style={{ borderColor: "#c44dff", color: "#c44dff" }}
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
                      color: "#c44dff",
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
              background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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

export default function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [darkMode, setDarkMode] = useState(true);
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(
    new Set([1, 3, 5]),
  );
  const [posts, setPosts] = useState<Post[]>(POSTS_INITIAL);
  const { profile, updateProfile } = useProfile();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>(STORIES_INITIAL);
  const [notifications, setNotifications] =
    useState<Notification[]>(NOTIFICATIONS);
  const [toastNotif, setToastNotif] = useState<Notification | null>(null);
  const [showToast, setShowToast] = useState(false);

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
          />
        );
      case "search":
        return (
          <SearchPage
            followedUsers={followedUsers}
            setFollowedUsers={setFollowedUsers}
          />
        );
      case "reels":
        return <ReelsPage userReels={posts.filter((p) => p.type === "reel")} />;
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
          />
        );
      case "chat":
        return <ChatPage />;
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
        return <AIStudioPage />;
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
            background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Connectly
        </h1>
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "#c44dff" }}
        />
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
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
                    background: "linear-gradient(135deg, #ff6b9d, #c44dff)",
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
      <Toaster />
    </div>
  );
}
