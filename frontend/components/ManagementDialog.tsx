import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

interface ManagementDialogProps {
    visible: boolean;
    onDismiss: () => void;
    onEdit: () => void;
    onDelete: () => void;
    deleteLoading: boolean;
    itemName: string;
    title: string;
}

const ManagementDialog = ({
    visible,
    onDismiss,
    onEdit,
    onDelete,
    deleteLoading,
    itemName,
    title,
}: ManagementDialogProps) => {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text>What would you like to do with "{itemName}"?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onEdit}>Edit</Button>
                    <Button onPress={onDelete} loading={deleteLoading}>Delete</Button>
                    <Button onPress={onDismiss}>Cancel</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

export default ManagementDialog;