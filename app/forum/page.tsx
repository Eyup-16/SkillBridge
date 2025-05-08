import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MessageSquare,
  MessageCircle,
  HelpCircle,
  Users,
  Lightbulb,
  Wrench,
  PenSquare,
  Search,
  TrendingUp,
  Clock,
  Filter,
  ChevronRight,
  Sparkles,
  User,
  Hash,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

// Map category names to icons
const categoryIcons: Record<string, any> = {
  "General Discussion": MessageSquare,
  "Service Requests": Users,
  "Skill Sharing": PenSquare,
  "Tools & Equipment": Wrench,
  "Success Stories": Lightbulb,
};

export default async function ForumPage(props: {
  searchParams: { category?: string; sort?: string; search?: string };
}) {
  // Safely extract search params
  const searchParams = props.searchParams || {};
  const category = searchParams.category;
  const sortParam = searchParams.sort;
  const searchQuery = searchParams.search;
  const supabase = await createClient();

  // Fetch forum categories
  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .order("name");

  // Build query for forum posts
  let postsQuery = supabase
    .from("forum_posts")
    .select(`
      *,
      forum_categories(id, name),
      user_id,
      forum_comments(count)
    `);

  // Apply sorting
  const sort = sortParam || "latest";
  if (sort === "latest") {
    postsQuery = postsQuery.order("created_at", { ascending: false });
  } else if (sort === "popular") {
    postsQuery = postsQuery.order("created_at", { ascending: false });
    // Note: We can't sort by comment count directly, so we'll sort by date for now
  }

  // Apply category filter if provided
  if (category) {
    const categoryId = categories?.find(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    )?.id;

    if (categoryId) {
      postsQuery = postsQuery.eq("category_id", categoryId);
    }
  }

  // Apply search filter if provided
  if (searchQuery) {
    postsQuery = postsQuery.or(
      `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
    );
  }

  // Execute query
  const { data: posts } = await postsQuery;

  // Fetch user profiles for the posts
  const userIds = Array.from(new Set(posts?.map((post) => post.user_id) || []));
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  // Create a map of user IDs to user data for easy lookup
  const userMap = (users || []).reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, any>
  );

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get the current category name for display
  const currentCategory = category
    ? categories?.find(
        (c) => c.name.toLowerCase() === category.toLowerCase()
      )?.name
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section with Unique Design */}
      <div className="relative overflow-hidden bg-[#1a1a2e] text-white">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-900/20"></div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-1 mb-6 rounded-full bg-white/10 backdrop-blur-sm">
              <Badge variant="secondary" className="px-3 py-1 bg-primary/90 text-white border-none">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Community Forum
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Join the Conversation
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Connect with skilled professionals, share ideas, and find solutions in our vibrant community forum
            </p>

            <div className="w-full mb-8">
              {user ? (
                <Button asChild size="lg" className="bg-white text-[#1a1a2e] hover:bg-white/90 hover:text-[#1a1a2e] w-full">
                  <Link href="/forum/new" className="flex items-center justify-center">
                    <PenSquare className="h-5 w-5 mr-2" />
                    Join the Conversation
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-white text-[#1a1a2e] hover:bg-white/90 hover:text-[#1a1a2e] w-full">
                  <Link href="/sign-in" className="flex items-center justify-center">
                    <User className="h-5 w-5 mr-2" />
                    Sign In to Join
                  </Link>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {categories?.map((cat) => {
                const IconComponent = categoryIcons[cat.name] || HelpCircle;
                return (
                  <Link
                    key={cat.id}
                    href={`/forum?category=${cat.name.toLowerCase()}`}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      cat.name.toLowerCase() === category?.toLowerCase()
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <IconComponent className="h-3.5 w-3.5 mr-1.5" />
                    {cat.name}
                  </Link>
                );
              })}
              <Link
                href="/forum"
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !category
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
                }`}
              >
                <Hash className="h-3.5 w-3.5 mr-1.5" />
                All Topics
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto fill-background">
            <path d="M0,96L60,80C120,64,240,32,360,32C480,32,600,64,720,69.3C840,75,960,53,1080,48C1200,43,1320,53,1380,58.7L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-4 space-y-6">
              <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b">
                  <h3 className="font-semibold">Search Discussions</h3>
                </CardHeader>
                <CardContent className="pt-4">
                  <form action="/forum" method="get">
                    {/* Preserve existing query parameters except search */}
                    {Object.entries(searchParams).map(([key, value]) => {
                      if (key !== 'search' && value) {
                        return (
                          <input
                            key={key}
                            type="hidden"
                            name={key}
                            value={value}
                          />
                        );
                      }
                      return null;
                    })}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Input
                        name="search"
                        placeholder="Search discussions..."
                        defaultValue={searchQuery || ""}
                        className="pl-9 bg-white/80 border-primary/10"
                      />
                    </div>
                    <Button type="submit" className="w-full mt-3">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Forum Stats</h3>
                    <Badge variant="outline" className="font-normal">
                      {posts?.length || 0} discussions
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        <span>Active Users</span>
                      </div>
                      <span className="text-sm font-medium">{userIds.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                        <span>Total Posts</span>
                      </div>
                      <span className="text-sm font-medium">{posts?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                        <span>Categories</span>
                      </div>
                      <span className="text-sm font-medium">{categories?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b">
                  <h3 className="font-semibold">View Options</h3>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  <div className="space-y-1">
                    <Link
                      href={`/forum${category ? `?category=${category}` : ''}`}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        !sortParam
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Latest Discussions
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                    <Link
                      href={`/forum?sort=popular${category ? `&category=${category}` : ''}`}
                      className={`flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        sortParam === 'popular'
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Popular Discussions
                      </span>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-white/20">
              <div className="border-b px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-bold flex items-center">
                    {currentCategory ? (
                      <>
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          {(() => {
                            const IconComponent = categoryIcons[currentCategory] || HelpCircle;
                            return <IconComponent className="h-4 w-4 text-primary" />;
                          })()}
                        </span>
                        {currentCategory} Discussions
                      </>
                    ) : (
                      <>
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <MessageSquare className="h-4 w-4 text-primary" />
                        </span>
                        All Discussions
                      </>
                    )}
                  </h2>

                  {/* Active filters */}
                  {searchQuery && (
                    <div className="flex items-center">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Search className="h-3 w-3 mr-1" />
                        Search: {searchQuery}
                        <Link href={`/forum${category ? `?category=${category}` : ''}${sortParam ? `${category ? '&' : '?'}sort=${sortParam}` : ''}`}>
                          <X className="h-3 w-3 ml-1" />
                        </Link>
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Forum posts */}
              {posts && posts.length > 0 ? (
                <div>
                  {posts.map((post, index) => {
                    const IconComponent = categoryIcons[post.forum_categories?.name] || HelpCircle;
                    return (
                      <Link
                        key={post.id}
                        href={`/forum/${post.id}`}
                        className={`block hover:bg-primary/5 transition-colors ${
                          index !== posts.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="p-6">
                          <div className="flex gap-4">
                            <div className="hidden sm:block">
                              <Avatar className="h-12 w-12 border-2 border-primary/10">
                                {userMap[post.user_id]?.avatar_url ? (
                                  <AvatarImage
                                    src={userMap[post.user_id]?.avatar_url}
                                    alt={userMap[post.user_id]?.full_name || "User"}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {(userMap[post.user_id]?.full_name || "A").charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                                {post.title}
                              </h3>

                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {post.content}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <Badge
                                  variant="outline"
                                  className="font-normal bg-primary/5 hover:bg-primary/10 transition-colors"
                                >
                                  <IconComponent className="h-3 w-3 mr-1 text-primary" />
                                  {post.forum_categories?.name}
                                </Badge>

                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>
                                    {new Date(post.created_at || "").toLocaleDateString(undefined, {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  <span>{post.forum_comments?.[0]?.count || 0} comments</span>
                                </div>

                                <div className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  <span>
                                    {userMap[post.user_id]?.full_name || post.user_id.substring(0, 8) || "Anonymous"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No discussions found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {category
                      ? `There are no discussions in this category yet. Be the first to start a conversation!`
                      : `There are no discussions yet. Be the first to start a conversation!`}
                  </p>
                  {user && (
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                      <Link href="/forum/new">Start a Discussion</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
