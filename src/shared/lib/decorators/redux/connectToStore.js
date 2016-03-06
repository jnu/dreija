import { connect } from 'react-redux';

export default function connectToStore(Cmp) {
    return connect(Cmp.deriveProps)(Cmp);
}
