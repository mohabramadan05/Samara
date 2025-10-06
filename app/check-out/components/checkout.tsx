'use client';

import { useState, useEffect } from 'react';
import styles from './checkout.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStarAndCrescent, faLocationDot, faTrashCan, faExclamationTriangle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import mapImg from '../../assets/map.png';
import visa from '../../assets/payment/visa.png';
import mastercard from '../../assets/payment/MasterCard.jpg';
import maestro from '../../assets/payment/logo-maestro.png';
import amex from '../../assets/payment/American_Express.png';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import PaymentDialog, { PaymentData } from './PaymentDialog';


interface City {
    id: string;
    name: string;
    is_active: string; // Changed to only handle string values "Y" or "N"
}
interface Address {
    id: string;
    user: string;
    country: string;
    city_id: string;
    city: string; // City name for display
    street: string;
    floor: string;
    landmark: string;
}



const Checkout = () => {


    // Contact info form state
    const [contactFormData, setContactFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
    });
    // Address form state
    const [addressFormData, setAddressFormData] = useState({
        country: 'Ireland',
        city_id: '',
        city: '',
        street: '',
        floor: '',
        landmark: ''
    });

    // Order summary state
    const [orderSummary, setOrderSummary] = useState({
        subtotal: 0,
        tax: 0,
        delivery: 0,
        total: 0,
        items: 0
    });

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showCityWarning, setShowCityWarning] = useState(false);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    // const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [notes, setNotes] = useState('');
    const [promoCodeStatus, setPromoCodeStatus] = useState<{ verified: boolean; message: string; discount?: number }>({ verified: false, message: '' });
    const [promoCodeLoading, setPromoCodeLoading] = useState(false);
    const [donationActive, setDonationActive] = useState(false);
    const [charityDiscount, setCharityDiscount] = useState<{ active: boolean; percentage: number }>({ active: false, percentage: 0 });
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [pointsLoading, setPointsLoading] = useState(false);
    const [pointsDiscountActive, setPointsDiscountActive] = useState(false);
    const [pointsDiscountAmount, setPointsDiscountAmount] = useState(0);
    const [pointsStatus, setPointsStatus] = useState<{ message: string; isError: boolean } | null>(null);
    const [showAddressConfirmation, setShowAddressConfirmation] = useState(false);

    // Add derived state for out-of-service
    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
    const selectedCityObj = selectedAddress ? cities.find(c => c.name.toLowerCase() === selectedAddress.city.toLowerCase()) : null;
    const isOutOfService = selectedCityObj && selectedCityObj.is_active !== 'Y';

    // Calculate discount amount and final total
    const discountAmount = promoCodeStatus.verified && promoCodeStatus.discount
        ? (orderSummary.subtotal * promoCodeStatus.discount) / 100
        : 0;
    const charityDiscountAmount = charityDiscount.active
        ? (orderSummary.subtotal * charityDiscount.percentage) / 100
        : 0;
    const donationAmount = donationActive ? 0.50 : 0;

    // If multiple discounts can apply, use sum:
    const totalDiscount = discountAmount + charityDiscountAmount + (pointsDiscountActive ? pointsDiscountAmount : 0);

    // Validate orderSummary before calculation
    const validOrderSummary = orderSummary &&
        typeof orderSummary.total === 'number' &&
        !isNaN(orderSummary.total) &&
        orderSummary.total >= 0;

    // Use one of the following:
    const finalTotal = validOrderSummary
        ? Math.max(0, orderSummary.total - totalDiscount + donationAmount)
        : 0;

    // Debug logging for calculation
    if (process.env.NODE_ENV === 'development') {
        console.log('Checkout Calculation Debug:', {
            orderSummary: orderSummary,
            validOrderSummary: validOrderSummary,
            discountAmount: discountAmount,
            charityDiscountAmount: charityDiscountAmount,
            donationAmount: donationAmount,
            finalTotal: finalTotal,
            promoCodeStatus: promoCodeStatus,
            charityDiscount: charityDiscount,
            donationActive: donationActive
        });
    }

    const handlePlaceOrder = () => {
        if (isOutOfService) return;
        setShowAddressConfirmation(true);
    };

    const handleConfirmAddress = () => {
        setShowAddressConfirmation(false);
        setShowPaymentDialog(true);
    };

    const handleCancelAddress = () => {
        setShowAddressConfirmation(false);
    };

    // Fetch cart summary and user session
    useEffect(() => {
        const fetchCartSummaryAndUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;
                if (!userId) {
                    setOrderSummary({ subtotal: 0, tax: 0, delivery: 0, total: 0, items: 0 });
                    setUser(null);
                    return;
                }
                setUser(session.user);

                const response = await fetch(`/api/cart/summary?user=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setOrderSummary({
                        subtotal: data.subtotal || 0,
                        tax: data.tax || 0,
                        delivery: data.delivery || 0,
                        total: data.total || 0,
                        items: data.items || 0
                    });
                }
            } catch {
                setOrderSummary({ subtotal: 0, tax: 0, delivery: 0, total: 0, items: 0 });
            }
        };
        fetchCartSummaryAndUser();
    }, []);

    // Fetch addresses and cities when user is available
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!user) return;
            try {
                const response = await fetch(`/api/users/address?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setAddresses(data.addresses || []);
                }
            } catch {
                // Handle error silently
            }
        };
        const fetchCities = async () => {
            try {
                const { data, error } = await supabase.from('cities').select('id, name, is_active').order('name', { ascending: true });
                if (error) throw error;
                setCities(data || []);
            } catch {
                // Handle error silently
            }
        };
        fetchAddresses();
        fetchCities();
    }, [user]);



    // Contact info change handler
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setContactFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Address form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAddressFormData({ ...addressFormData, [name]: value });
    };

    const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const city = cities.find(c => String(c.id) === value);
        setAddressFormData({
            ...addressFormData,
            city_id: value,
            city: city?.name || '' // Set the city name when selecting
        });
        setSelectedCity(city || null);
        setShowCityWarning(city?.is_active !== 'Y');


    };

    const handleAddAddress = () => {
        setEditingAddress(null);
        setAddressFormData({ country: 'Ireland', city_id: '', city: '', street: '', floor: '', landmark: '' });
        setShowForm(true);
    };

    const handleClosePaymentDialog = () => {
        setShowPaymentDialog(false);
        setPaymentLoading(false);
    };

    // Generate unique random reference
    const generateUniqueReference = () => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        return `REF-${timestamp}-${random}`.toUpperCase();
    };


    // create check out 
    const createCheckOut = async () => {
        try {
            const formattedAmount = parseFloat(finalTotal.toFixed(2));
            const uniqueReference = generateUniqueReference();

            const res = await fetch('/api/sumup/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: formattedAmount,
                    currency: 'EUR',
                    description: 'Website Order',
                    checkout_reference: uniqueReference,
                })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Failed to create SumUp checkout');
            }

            const data = await res.json();

            // SumUp creates a hosted checkout. Prefer redirect URL if provided
            const status = data?.status;
            return { data, status: status, reference: uniqueReference, id: data.id };
        } catch (e) {
            throw e;
        }
    }



    const handlePaymentSubmit = async (paymentData: PaymentData) => {
        setPaymentLoading(true);
        try {
            // Validate required data
            if (!user || !selectedAddressId) {
                throw new Error('Missing user or address information');
            }

            // Validate finalTotal before sending to payment gateway
            if (typeof finalTotal !== 'number' || isNaN(finalTotal) || finalTotal <= 0) {
                throw new Error(`Invalid final total: ${finalTotal}. Please refresh the page and try again.`);
            }

            // Ensure finalTotal is properly formatted (2 decimal places for currency)
            const formattedAmount = parseFloat(finalTotal.toFixed(2));

            // Additional validation for payment gateway requirements
            if (formattedAmount < 0.01) {
                throw new Error('Order total must be at least €0.01');
            }

            if (formattedAmount > 999999.99) {
                throw new Error('Order total cannot exceed €999,999.99');
            }


            // Create SumUp checkout via backend
            const checkout = await createCheckOut();
            if (checkout?.status !== 'PENDING') {
                throw new Error('Checkout not created');
            }

            console.log('Checkout created:', checkout.id);


            // Submit card details to SumUp via secure backend
            const payRes = await fetch(`/api/sumup/checkout/${checkout.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    payment_type: 'card',
                    card: {
                        name: paymentData.cardholderName,
                        number: paymentData.cardNumber.replace(/\s/g, ''),
                        expiry_month: paymentData.expiryMonth,
                        expiry_year: paymentData.expiryYear,
                        cvv: paymentData.cvv,
                    }
                })
            });

            const payJson = await payRes.json().catch(() => ({}));
            if (!payRes.ok) {
                throw new Error(payJson?.error || 'Payment authorization failed');
            }


            const paymentStatus = payJson?.status;
            if (paymentStatus === 'FAILED') {
                throw new Error(payJson?.message || 'Payment failed');
            }
            if (paymentStatus !== 'PAID') {
                throw new Error('Payment not completed yet');
            }

            // Prepare order data for database HELOL
            const orderData = {
                userId: user.id,
                addressData: selectedAddress,
                contactInfo: contactFormData,
                promoCode: promoCodeStatus.verified ? promoCode : null,
                discount: discountAmount,
                charityDiscount: charityDiscountAmount,
                donation: donationAmount,
                notes: notes,
                transactionCode: checkout?.data?.id || checkout?.reference,
                finalTotal: finalTotal,
                orderSummary: {
                    subtotal: orderSummary.subtotal,
                    tax: orderSummary.tax,
                    delivery: orderSummary.delivery,
                    total: orderSummary.total,
                    items: orderSummary.items
                },
            };

            // Create order only when payment is PAID
            const orderResponse = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            const orderResult = await orderResponse.json();

            // Deduct points when points discount used
            if (pointsDiscountActive && user?.id) {
                try {
                    await fetch('/api/users/wallet', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, deduct: 300 })
                    });
                } catch {
                    // Non-blocking: ignore deduction failure here
                }
            }

            // Close dialog and go to order details
            setShowPaymentDialog(false);
            setPaymentLoading(false);
            window.location.href = `/order-details/${orderResult.orderId}`;

        } catch (error) {
            setPaymentLoading(false);
            alert(`Payment failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
        }
    };



    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setAddressFormData({
            country: 'Ireland',
            city_id: address.city_id || '',
            city: address.city || '',
            street: address.street || '',
            floor: address.floor || '',
            landmark: address.landmark || ''
        });
        setShowForm(true);
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user) return;
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const response = await fetch(`/api/users/address?userId=${user.id}&addressId=${addressId}`, { method: 'DELETE' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to delete address');
            // Refresh the addresses list
            const res = await fetch(`/api/users/address?userId=${user.id}`);
            const addrData = await res.json();
            setAddresses(addrData.addresses || []);
        } catch {
            alert('Failed to delete address. Please try again.');
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const addressData = { ...addressFormData, id: editingAddress?.id };
            if (!addressFormData.city_id || addressFormData.city_id === 'new-city') {
                if (!addressFormData.city.trim()) {
                    alert('Please enter a city name');
                    return;
                }
            }
            const response = await fetch('/api/users/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, addressData })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to save address');
            setShowForm(false);
            // Refresh addresses and cities
            const res = await fetch(`/api/users/address?userId=${user.id}`);
            const addrData = await res.json();
            setAddresses(addrData.addresses || []);
            const { data: citiesData } = await supabase.from('cities').select('id, name, is_active').order('name', { ascending: true });
            setCities(citiesData || []);
        } catch {
            alert('Failed to save address. Please try again.');
        }
    };

    const handleVerifyPromoCode = async () => {
        if (!promoCode.trim()) {
            setPromoCodeStatus({ verified: false, message: 'Please enter a promo code' });
            return;
        }

        if (!user) {
            setPromoCodeStatus({ verified: false, message: 'Please log in to verify promo code' });
            return;
        }

        // Check if the promocode is "charity" (case insensitive)
        if (promoCode.trim().toLowerCase() === 'charity') {
            if (finalTotal > 100) {
                setPromoCodeStatus({
                    verified: false,
                    message: 'Charity discount is only available for orders under €100'
                });
                return;
            }

            setPromoCodeLoading(true);
            try {
                const response = await fetch(`/api/charity/check-discount?userId=${user.id}`);

                if (response.ok) {
                    const data = await response.json();

                    if (data.eligible) {
                        setCharityDiscount({ active: true, percentage: 50 });
                        setPromoCodeStatus({
                            verified: true,
                            message: 'Charity discount applied! 50% off',
                            discount: 0 // Set to 0 since charity discount is handled separately
                        });
                    } else {
                        setPromoCodeStatus({
                            verified: false,
                            message: data.message || 'You are not eligible for charity discount'
                        });
                    }
                } else {
                    setPromoCodeStatus({
                        verified: false,
                        message: 'Failed to verify charity eligibility'
                    });
                }
            } catch {
                setPromoCodeStatus({
                    verified: false,
                    message: 'Failed to verify charity eligibility'
                });
            } finally {
                setPromoCodeLoading(false);
            }
            return;
        }

        setPromoCodeLoading(true);
        setPromoCodeStatus({ verified: false, message: '' });

        try {
            const response = await fetch(`/api/promocode/verify?code=${promoCode}&userId=${user.id}`);
            const data = await response.json();

            if (!response.ok) {
                setPromoCodeStatus({ verified: false, message: data.message || 'Failed to verify promo code' });
                return;
            }

            if (data.valid) {
                setPromoCodeStatus({
                    verified: true,
                    message: `Promo code applied! ${data.discount_value}% off`,
                    discount: data.discount_value
                });
            } else {
                setPromoCodeStatus({ verified: false, message: data.message || 'Invalid promo code' });
            }
        } catch {
            setPromoCodeStatus({ verified: false, message: 'Failed to verify promo code. Please try again.' });
        } finally {
            setPromoCodeLoading(false);
        }
    };

    const handleDonationToggle = () => {
        setDonationActive(!donationActive);
    };

    const handleRemovePromoCode = () => {
        setPromoCode('');
        setPromoCodeStatus({ verified: false, message: '' });
        setCharityDiscount({ active: false, percentage: 0 });
    };

    const handleApplyPointsDiscount = async () => {
        if (!user) {
            setPointsStatus({ message: 'Please log in to use points.', isError: true });
            return;
        }
        try {
            setPointsLoading(true);
            setPointsStatus(null);
            const response = await fetch(`/api/users/wallet?userId=${user.id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch points');
            }
            const userPoints = data.points || 0;
            if (userPoints > 300) {
                if (pointsDiscountActive) {
                    setPointsDiscountActive(false);
                    setPointsDiscountAmount(0);
                    setPointsStatus({ message: 'Points discount removed.', isError: false });
                } else {
                    setPointsDiscountActive(true);
                    setPointsDiscountAmount(10);
                    setPointsStatus({ message: '€10 discount applied using your points.', isError: false });
                }
            } else {
                setPointsStatus({ message: 'You need more than 300 points to apply this discount.', isError: true });
            }
        } catch {
            setPointsStatus({ message: 'Unable to check points at the moment. Please try again.', isError: true });
        } finally {
            setPointsLoading(false);
        }
    };

    return (
        <section className={styles.checkout}>
            <h2><span>purchase</span> product</h2>
            <div className={styles.checkoutDivider}>
                <div className={styles.checkoutDividerLeft} >
                    <div className={styles.contactInfo} >
                        <h3>
                            <span>Contact</span> Information
                        </h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="firstName">
                                    First Name<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Type Your First Name"
                                    value={contactFormData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="lastName">
                                    Last Name<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Type Your Last Name"
                                    value={contactFormData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="phone">
                                    Phone Number<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    placeholder="Type Your Phone number"
                                    value={contactFormData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="email">
                                    Email<span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Type Your Email"
                                    value={contactFormData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.addressInfo} >
                        <h3>
                            <span>Select</span> Address
                        </h3>
                        <div className={styles.addressList}>
                            {addresses.length === 0 && !showForm ? (
                                // <div>No addresses found.</div>
                                <>
                                    <button className={styles.addAddressButton} onClick={handleAddAddress}>
                                        Add New Address <FontAwesomeIcon icon={faLocationDot} />
                                    </button>

                                </>
                            ) : (
                                <>
                                    {isOutOfService && (
                                        <div className={styles.cityWarning}>
                                            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
                                            <span>The chosen area is out of service right now. Please select an available address.</span>
                                        </div>
                                    )}
                                    {!showForm && (
                                        <>
                                            {addresses.map(address => (
                                                <div
                                                    key={address.id}
                                                    className={`${styles.addressCard} ${selectedAddressId === address.id ? styles.selectedAddressCard : ''}`}
                                                    onClick={() => {
                                                        setSelectedAddressId(address.id);
                                                    }}
                                                    tabIndex={0}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className={styles.addressContent}>
                                                        <Image src={mapImg} width={90} height={90} alt="map" />
                                                        <div className={styles.addressHeader}>
                                                            <p className={styles.addressName}>{address.country} <span> ({address.city}) </span></p>
                                                            <p className={styles.addressLine}>{address.floor} {address.street},  {address.city}</p>
                                                            {address.landmark && (
                                                                <p className={styles.addressLine}>{address.landmark}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles.addressActions}>
                                                        <div className={`${styles.addressAction} ${styles.editAction}`} onClick={e => { e.stopPropagation(); handleEditAddress(address); }}>Edit</div>
                                                        <div className={`${styles.addressAction} ${styles.deleteAction}`} onClick={e => { e.stopPropagation(); handleDeleteAddress(address.id); }}><FontAwesomeIcon icon={faTrashCan} /></div>
                                                        {selectedAddressId === address.id ? (
                                                            <div className={styles.selectedCheck}>
                                                                <div className={styles.selectedCheckInner}></div>
                                                            </div>
                                                        ) : (
                                                            <div className={styles.unselectedCheck}>
                                                                <div className={styles.unselectedCheckInner}></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <button className={styles.addAddressButton} onClick={handleAddAddress}>
                                                Add New Address <FontAwesomeIcon icon={faLocationDot} />
                                            </button>

                                        </>
                                    )}

                                </>
                            )}
                            {showForm && (
                                <form className={styles.addressForm} onSubmit={handleFormSubmit}>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Country</label>
                                        <input type="text" name="country" value="Ireland" className={styles.formInput} disabled required />
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>City</label>
                                        <select name="city_id" value={addressFormData.city_id || ''} onChange={handleCitySelectChange} className={styles.formInput} required>
                                            <option className={styles.option} value="" disabled>Select a city</option>
                                            {cities.map(city => (
                                                <option className={styles.option} key={city.id} value={city.id}>{city.name}</option>
                                            ))}
                                        </select>
                                        {showCityWarning && (
                                            <div className={styles.cityWarning}>
                                                <FontAwesomeIcon icon={faExclamationTriangle} className={styles.warningIcon} />
                                                <span>Warning: we are not available in {selectedCity?.name} at the moment</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Street</label>
                                        <input type="text" name="street" value={addressFormData.street} onChange={handleInputChange} className={styles.formInput} required />
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Floor</label>
                                        <input type="text" name="floor" value={addressFormData.floor} onChange={handleInputChange} className={styles.formInput} required />
                                    </div>
                                    <div className={styles.formField}>
                                        <label className={styles.formLabel}>Landmark (Optional)</label>
                                        <input type="text" name="landmark" value={addressFormData.landmark} onChange={handleInputChange} className={styles.formInput} />
                                    </div>
                                    <div className={styles.formActions}>
                                        <button type="submit" className={styles.submitButton}>{editingAddress ? 'Update Address' : 'Add Address'}</button>
                                        <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                    <div className={styles.paymentDetails} >
                        <h3>
                            <span>Payment</span> Details
                        </h3>

                        <div className={styles.paymentMethodItem}>
                            {/* <div className={styles.paymentMethodIcon}>
                                <div className={styles.selectedCheck2}>
                                    <div className={styles.selectedCheckInner2}></div>
                                </div>
                                <Image src={paymentMethodIcon} alt="payment method" width={100} />
                            </div> */}

                            <div className={styles.paymentMethod}>
                                <div className={styles.paymentMethods}>
                                    <Image className={styles.paymentMethodImage} src={visa} alt="payment method" width={0} height={0} />
                                </div>
                                <div className={styles.paymentMethods}>
                                    <Image className={styles.paymentMethodImage} src={mastercard} alt="payment method" width={0} height={0} />
                                </div>
                                <div className={styles.paymentMethods}>
                                    <Image className={styles.paymentMethodImage} src={amex} alt="payment method" width={0} height={0} />
                                </div>
                                <div className={styles.paymentMethods}>
                                    <Image className={styles.paymentMethodImage} src={maestro} alt="payment method" width={0} height={0} />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
                <div className={styles.checkoutDividerRight} >
                    <div className={styles.orderSummary} >
                        <h3><span style={{ color: '#CDA00D' }}>Order</span> Summary</h3>
                        <div className={styles.orderSummaryRow}>Total Items <span style={{ color: '#CDA00D' }}>
                            {orderSummary.items}
                        </span></div>
                        <div className={styles.orderSummaryRow}>Subtotal <span style={{ color: '#CDA00D' }}>
                            {orderSummary.subtotal}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        <div className={styles.orderSummaryRow}>Tax <span style={{ color: '#CDA00D' }}>
                            {orderSummary.tax}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        <div className={styles.orderSummaryRow}>Delivery <span style={{ color: '#CDA00D' }}>
                            {orderSummary.delivery}
                            <span style={{ color: '#000' }}> €</span></span></div>
                        {charityDiscount.active && (
                            <div className={styles.orderSummaryRow} style={{ color: '#9C27B0' }}>
                                Charity Discount ({charityDiscount.percentage}%)
                                <span style={{ color: '#9C27B0' }}>
                                    -{charityDiscountAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        {promoCodeStatus.verified && promoCodeStatus.discount && (
                            <div className={styles.orderSummaryRow} style={{ color: '#4CAF50' }}>
                                Discount ({promoCodeStatus.discount}%)
                                <span style={{ color: '#4CAF50' }}>
                                    -{discountAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        {pointsDiscountActive && (
                            <div className={styles.orderSummaryRow} style={{ color: '#2196F3' }}>
                                Points Discount
                                <span style={{ color: '#2196F3' }}>
                                    -{pointsDiscountAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        {donationActive && (
                            <div className={styles.orderSummaryRow} style={{ color: '#E92B2B' }}>
                                Donation
                                <span style={{ color: '#E92B2B' }}>
                                    {donationAmount.toFixed(2)} €
                                </span>
                            </div>
                        )}
                        <div className={`${styles.orderSummaryRow} ${styles.orderSummaryTotal}`}>Total <span style={{ color: '#CDA00D' }}>
                            {finalTotal.toFixed(2)}
                            <span style={{ color: '#000' }}> €</span></span></div>




                        <div className={styles.extraFields} >
                            <button
                                className={styles.donateButton}
                                onClick={handleDonationToggle}
                                style={{
                                    opacity: donationActive ? 1 : 0.8,
                                    transform: donationActive ? 'scale(1.02)' : 'scale(1)',
                                    transition: 'all 0.2s ease'
                                }}

                            >
                                <span>{donationActive ? 'Remove Donation' : 'Donate To Gaza'}</span>
                                <span>50 Cent</span>
                            </button>
                            <button className={`${styles.actionBtn} ${styles.pointsBtn}`}
                                onClick={handleApplyPointsDiscount}
                                disabled={pointsLoading}
                            >
                                {pointsLoading ? 'Checking…' : (pointsDiscountActive ? 'Remove Points Discount' : 'Buy With Points')} <span className={styles.pointsIcon}>
                                    <svg width="25" height="22" viewBox="0 0 25 24" fill="none" xmlns="https://www.w3.org/2000/svg">
                                        <path d="M6.42394 16C6.53394 15.51 6.33394 14.81 5.98394 14.46L3.55394 12.03C2.79394 11.27 2.49394 10.46 2.71394 9.76C2.94394 9.06 3.65394 8.58 4.71394 8.4L7.83394 7.88C8.28394 7.8 8.83394 7.4 9.04394 6.99L10.7639 3.54C11.2639 2.55 11.9439 2 12.6839 2C13.4239 2 14.1039 2.55 14.6039 3.54L16.3239 6.99C16.4539 7.25 16.7239 7.5 17.0139 7.67L6.24394 18.44C6.10394 18.58 5.86394 18.45 5.90394 18.25L6.42394 16Z" fill="white" />
                                        <path d="M19.3844 14.4599C19.0244 14.8199 18.8244 15.5099 18.9444 15.9999L19.6344 19.0099C19.9244 20.2599 19.7444 21.1999 19.1244 21.6499C18.8744 21.8299 18.5744 21.9199 18.2244 21.9199C17.7144 21.9199 17.1144 21.7299 16.4544 21.3399L13.5244 19.5999C13.0644 19.3299 12.3044 19.3299 11.8444 19.5999L8.91437 21.3399C7.80437 21.9899 6.85437 22.0999 6.24437 21.6499C6.01437 21.4799 5.84437 21.2499 5.73438 20.9499L17.8944 8.7899C18.3544 8.3299 19.0044 8.1199 19.6344 8.2299L20.6444 8.3999C21.7044 8.5799 22.4144 9.0599 22.6444 9.7599C22.8644 10.4599 22.5644 11.2699 21.8044 12.0299L19.3844 14.4599Z" fill="white" />
                                    </svg>
                                </span>
                            </button>
                            {pointsStatus && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginTop: '10px',
                                    backgroundColor: pointsStatus.isError ? '#ffeaea' : '#e8f5e8',
                                    border: `1px solid ${pointsStatus.isError ? '#f44336' : '#4CAF50'}`,
                                    color: pointsStatus.isError ? '#c62828' : '#2e7d2e',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <span style={{ flex: 1, color: pointsStatus.isError ? '#c62828' : '#2e7d2e', }}>{pointsStatus.message}</span>
                                </div>
                            )}
                            <div className={`${styles.formGroup} ${styles.promocodeGroup}`} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                                <input
                                    type="text"
                                    id="promoCode"
                                    name="promoCode"
                                    placeholder="Add Your Coupon"
                                    value={promoCode}
                                    onChange={e => setPromoCode(e.target.value)}
                                    className={styles.formInput}
                                    style={{ color: '#000', flex: 1, opacity: pointsDiscountActive ? 0.6 : 1 }}
                                    disabled={pointsDiscountActive}
                                />
                                <button
                                    type="button"
                                    className={styles.verifyButton}
                                    style={{ whiteSpace: 'nowrap' }}
                                    onClick={handleVerifyPromoCode}
                                    disabled={promoCodeLoading || pointsDiscountActive}
                                >
                                    {promoCodeLoading ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                            {promoCodeStatus.message && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    backgroundColor: promoCodeStatus.verified ? '#e8f5e8' : '#ffeaea',
                                    border: `1px solid ${promoCodeStatus.verified ? '#4CAF50' : '#f44336'}`,
                                    color: promoCodeStatus.verified ? '#2e7d2e' : '#c62828',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    <FontAwesomeIcon
                                        icon={promoCodeStatus.verified ? faCheckCircle : faTimesCircle}
                                        style={{ fontSize: '16px' }}
                                    />
                                    <span style={{ flex: 1, color: promoCodeStatus.verified ? '#2e7d2e' : '#c62828' }}>{promoCodeStatus.message}</span>
                                    {promoCodeStatus.verified && (
                                        <button
                                            onClick={handleRemovePromoCode}
                                            style={{
                                                background: 'none',
                                                border: '1px solid #2e7d2e',
                                                color: '#2e7d2e',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className={styles.formGroup}>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Notes..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className={styles.formInput}
                                    rows={5}
                                    style={{
                                        resize: 'none', backgroundColor: '#fff', color: '#2e7d2e',
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            className={styles.orderSummaryBuy}
                            disabled={isOutOfService || !selectedAddressId}
                            style={{
                                pointerEvents: isOutOfService ? 'none' : 'auto',
                                opacity: isOutOfService ? 0.5 : 1,
                                cursor: isOutOfService ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Place Order  <FontAwesomeIcon icon={faStarAndCrescent} />
                        </button>
                    </div>


                </div>
            </div>

            {/* Address Confirmation Popup */}
            {showAddressConfirmation && selectedAddress && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '20px',
                        padding: '30px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        animation: 'slideIn 0.3s ease-out',
                        border: '2px solid #CDA00D'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: '#CDA00D',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 15px',
                                boxShadow: '0 4px 15px rgba(205, 160, 13, 0.3)'
                            }}>
                                <FontAwesomeIcon
                                    icon={faLocationDot}
                                    style={{
                                        fontSize: '24px',
                                        color: '#fff'
                                    }}
                                />
                            </div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#333',
                                marginBottom: '5px'
                            }}>
                                Confirm <span style={{ color: '#CDA00D' }}>Delivery Address</span>
                            </h3>
                            <p style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '14px'
                            }}>
                                Please review your delivery address before proceeding
                            </p>
                        </div>

                        <div style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '15px',
                            padding: '25px',
                            marginBottom: '25px',
                            border: '1px solid #e9ecef'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '20px'
                            }}>
                                <Image
                                    src={mapImg}
                                    width={50}
                                    height={50}
                                    alt="map"
                                    style={{ marginRight: '15px' }}
                                />
                                <div>
                                    <h4 style={{
                                        margin: 0,
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>
                                        Delivery Address
                                    </h4>
                                    <p style={{
                                        margin: '5px 0 0',
                                        fontSize: '14px',
                                        color: '#666'
                                    }}>
                                        Your order will be delivered to this address
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gap: '12px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>Country:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.country}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>City:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.city}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>Street:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.street}</span>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px 15px',
                                    backgroundColor: '#fff',
                                    borderRadius: '10px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <span style={{
                                        fontWeight: '600',
                                        color: '#CDA00D',
                                        minWidth: '80px',
                                        fontSize: '14px'
                                    }}>Floor:</span>
                                    <span style={{
                                        color: '#333',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}>{selectedAddress.floor}</span>
                                </div>

                                {selectedAddress.landmark && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 15px',
                                        backgroundColor: '#fff',
                                        borderRadius: '10px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <span style={{
                                            fontWeight: '600',
                                            color: '#CDA00D',
                                            minWidth: '80px',
                                            fontSize: '14px'
                                        }}>Landmark:</span>
                                        <span style={{
                                            color: '#333',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}>{selectedAddress.landmark}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center'
                        }}>
                            <button
                                onClick={handleCancelAddress}
                                style={{
                                    padding: '12px 25px',
                                    border: '2px solid #6c757d',
                                    backgroundColor: 'transparent',
                                    color: '#6c757d',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = '#6c757d';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = '#6c757d';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAddress}
                                style={{
                                    padding: '12px 25px',
                                    border: 'none',
                                    backgroundColor: '#CDA00D',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minWidth: '120px',
                                    boxShadow: '0 4px 15px rgba(205, 160, 13, 0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(205, 160, 13, 0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(205, 160, 13, 0.3)';
                                }}
                            >
                                Confirm & Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Dialog */}
            <PaymentDialog
                isOpen={showPaymentDialog}
                onClose={handleClosePaymentDialog}
                onPaymentSubmit={handlePaymentSubmit}
                totalAmount={finalTotal}
                loading={paymentLoading}
            />
        </section>
    )
}

export default Checkout;