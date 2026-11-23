import { useAuth } from '../context/AuthContext.jsx'
import AdminBookButtons from './AdminBookButtons.jsx';
import RequestBtn from './RequestBtn.jsx';

const BookActions = ({book, className, onDeleted}) => {
    const {isAdmin} = useAuth();

    if(isAdmin) return <AdminBookButtons className={className} book={book} onDeleted={onDeleted} />
    return <RequestBtn book={book} className={className} />
}

export default BookActions
