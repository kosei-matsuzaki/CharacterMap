// STYLESのインポートは不要になったので削除してOKです

export default function Button({
	variant = "primary",
	onClick,
	style,
	children,
	className,
	...props
}) {
	// variantプロップに応じてCSSクラスを切り替える
	let cssClass = "btn";

	switch (variant) {
		case "primary":
			cssClass += " btn-primary";
			break;
		case "danger":
			cssClass += " btn-danger";
			break;
		case "secondary":
			cssClass += " btn-secondary";
			break;
		case "icon": // 設定ボタン用
			cssClass += " btn-icon";
			break;
		default:
			cssClass += " btn-primary";
	}

	// 追加のclassNameがあれば結合
	if (className) cssClass += ` ${className}`;

	return (
		<button className={cssClass} onClick={onClick} style={style} {...props}>
			{children}
		</button>
	);
}
