import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) => {
    // Ensure alerts is defined and is an array
    if (!alerts || !Array.isArray(alerts)) {
        return null;
    }

    return (
        <>
            {alerts.length > 0 &&
                alerts.map(alert => (
                    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
                        {alert.msg}
                    </div>
                ))}
        </>
    );
};

Alert.propTypes = {
    alerts: PropTypes.array.isRequired, // Validate that alerts is an array
};

// Map state from Redux to the component's props
const mapStateToProps = state => ({
    alerts: state.alert, // Assuming 'alert' is the key for alert reducer in your rootReducer
});

export default connect(mapStateToProps)(Alert);
