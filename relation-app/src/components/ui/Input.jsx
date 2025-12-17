export default function Input({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	textarea = false,
	rows = 3,
	containerStyle = {}, // 外部からマージン等を調整したい場合用
	accept, // file input用
}) {
	return (
		<div className="input-group" style={containerStyle}>
			{label && <label className="input-label">{label}</label>}

			{textarea ? (
				<textarea
					className="input-field input-field-textarea"
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					rows={rows}
				/>
			) : (
				<input
					type={type}
					className="input-field"
					value={value} // type="file" の時は value は無視される(警告が出る場合がある)が、Reactの制御としてはこのままで概ね動作する。厳密にはfileの時はvalue={undefined}にするのがベスト。
					// 簡易修正:
					// value={type === 'file' ? undefined : value}
					onChange={onChange}
					placeholder={placeholder}
					accept={accept}
				/>
			)}
		</div>
	);
}
