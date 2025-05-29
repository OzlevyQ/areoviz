import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PostProps {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export default function Post({ title, content, authorName, createdAt }: PostProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          By {authorName} • {createdAt}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{content}</p>
      </CardContent>
    </Card>
  );
} 