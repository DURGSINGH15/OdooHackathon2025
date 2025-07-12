import React, { useState } from 'react'
import { useRBAC } from '@/contexts/rbac-context'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Flag, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  UserX, 
  UserCheck,
  MoreHorizontal 
} from 'lucide-react'
import { ModerationAction } from '@/types/rbac'
import { useToast } from '@/hooks/use-toast'

interface ModerationMenuProps {
  resourceType: 'question' | 'answer' | 'comment' | 'user'
  resourceId: string
  ownerId: string
  isHidden?: boolean
  isLocked?: boolean
  isFlagged?: boolean
  isFeatured?: boolean
  className?: string
}

export function ModerationMenu({
  resourceType,
  resourceId,
  ownerId,
  isHidden = false,
  isLocked = false,
  isFlagged = false,
  isFeatured = false,
  className
}: ModerationMenuProps) {
  const rbac = useRBAC()
  const { toast } = useToast()
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState<ModerationAction | null>(null)
  const [reason, setReason] = useState('')

  // Don't show moderation menu if user can't moderate
  if (!rbac.canModerate(ownerId)) {
    return null
  }

  const handleModerationAction = (action: ModerationAction, requiresReason = false) => {
    if (requiresReason) {
      setSelectedAction(action)
      setShowReasonDialog(true)
    } else {
      executeModerationAction(action)
    }
  }

  const executeModerationAction = (action: ModerationAction, actionReason?: string) => {
    // In a real app, this would call an API
    console.log('Moderation action:', {
      action,
      resourceType,
      resourceId,
      moderatorId: rbac.user?.id,
      reason: actionReason || reason,
      timestamp: new Date().toISOString()
    })

    toast({
      title: 'Moderation Action',
      description: `${action.replace('_', ' ')} action has been applied.`,
    })

    // Reset state
    setReason('')
    setSelectedAction(null)
    setShowReasonDialog(false)
  }

  const confirmAction = () => {
    if (selectedAction) {
      executeModerationAction(selectedAction, reason)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Shield className="h-4 w-4" />
            <span className="sr-only">Moderation menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Moderation Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Flag/Unflag */}
          <DropdownMenuItem
            onClick={() => handleModerationAction(isFlagged ? 'unflag' : 'flag')}
          >
            <Flag className="mr-2 h-4 w-4" />
            {isFlagged ? 'Unflag' : 'Flag'}
          </DropdownMenuItem>

          {/* Hide/Unhide */}
          <DropdownMenuItem
            onClick={() => handleModerationAction(isHidden ? 'unhide' : 'hide', true)}
          >
            {isHidden ? <Eye className="mr-2 h-4 w-4" /> : <EyeOff className="mr-2 h-4 w-4" />}
            {isHidden ? 'Unhide' : 'Hide'}
          </DropdownMenuItem>

          {/* Lock/Unlock (for questions) */}
          {resourceType === 'question' && (
            <DropdownMenuItem
              onClick={() => handleModerationAction(isLocked ? 'unlock' : 'lock', true)}
            >
              {isLocked ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
              {isLocked ? 'Unlock' : 'Lock'}
            </DropdownMenuItem>
          )}

          {/* Feature/Unfeature (for questions) */}
          {resourceType === 'question' && (
            <DropdownMenuItem
              onClick={() => handleModerationAction(isFeatured ? 'unfeature' : 'feature')}
            >
              <Shield className="mr-2 h-4 w-4" />
              {isFeatured ? 'Unfeature' : 'Feature'}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => handleModerationAction('delete', true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>

          {/* Ban user (only for admin) */}
          {rbac.isAdmin() && resourceType !== 'user' && (
            <DropdownMenuItem
              onClick={() => handleModerationAction('ban_user', true)}
              className="text-destructive"
            >
              <UserX className="mr-2 h-4 w-4" />
              Ban User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reason Dialog */}
      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderation Action</DialogTitle>
            <DialogDescription>
              Please provide a reason for this moderation action. This will be logged and may be visible to the user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReasonDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={!reason.trim()}
              variant={selectedAction === 'delete' || selectedAction === 'ban_user' ? 'destructive' : 'default'}
            >
              Confirm {selectedAction?.replace('_', ' ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface QuickModerationProps {
  resourceType: 'question' | 'answer' | 'comment'
  resourceId: string
  ownerId: string
  className?: string
}

export function QuickModeration({
  resourceType,
  resourceId,
  ownerId,
  className
}: QuickModerationProps) {
  const rbac = useRBAC()
  const { toast } = useToast()

  if (!rbac.canModerate(ownerId)) {
    return null
  }

  const quickFlag = () => {
    toast({
      title: 'Content Flagged',
      description: 'This content has been flagged for review.',
    })
  }

  const quickHide = () => {
    toast({
      title: 'Content Hidden',
      description: 'This content has been hidden from public view.',
    })
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={quickFlag}
        title="Flag content"
      >
        <Flag className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={quickHide}
        title="Hide content"
      >
        <EyeOff className="h-3 w-3" />
      </Button>
    </div>
  )
}
