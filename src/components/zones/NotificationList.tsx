import { useNotifications, useDeleteNotification } from "@/hooks/useNotifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface NotificationListProps {
  zoneId: string;
}

export const NotificationList = ({ zoneId }: NotificationListProps) => {
  const { data: notifications, isLoading } = useNotifications(zoneId);
  const deleteNotification = useDeleteNotification();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "warning": return "default";
      case "info": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "default";
      case "scheduled": return "secondary";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this notification?")) {
      await deleteNotification.mutateAsync({ id, zoneId });
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading notifications...</div>;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No notifications yet</p>
        <p className="text-sm">Create your first notification to send messages to households</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {notification.title}
                  <Badge variant={getSeverityColor(notification.severity)}>
                    {notification.severity}
                  </Badge>
                  <Badge variant={getStatusColor(notification.status)}>
                    {notification.status}
                  </Badge>
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(notification.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{notification.target_audience}</span>
              </div>
              
              {notification.scheduled_for && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(notification.scheduled_for), "PPP")}
                  </span>
                </div>
              )}
              
              {notification.sent_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Sent: {format(new Date(notification.sent_at), "PPP")}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1 pt-1">
              {notification.send_method?.map((method) => (
                <Badge key={method} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
